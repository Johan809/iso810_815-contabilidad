using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ContabilidadAPI.Managers
{
    public class EntradaContableManager : AbstractManager<EntradaContableManager>
    {
        #region Constructor
        public EntradaContableManager(EntityContext context, ILogger<EntradaContableManager> logger)
            : base(context, logger) { }
        #endregion

        #region Metodos
        public async Task<EntradaContable?> Buscar(int id)
        {
            try
            {
                return await Context.EntradasContables.Find(x => x.Id == id)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar EntradaContable por Id: {0}; EX: {1}", id, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<EntradaContable?> Buscar(string objectId)
        {
            try
            {
                return await Context.EntradasContables.Find(x => x.ObjectId == objectId)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar EntradaContable por ObjectId: {0}; EX: {1}", objectId, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<List<EntradaContable>> Buscar(EntradaContable.Where where)
        {
            try
            {
                var filtroBuilder = Builders<EntradaContable>.Filter;
                var filtro = filtroBuilder.Empty;

                if (where.Id > 0)
                    filtro &= filtroBuilder.Eq(x => x.Id, where.Id);

                if (!string.IsNullOrEmpty(where.Descripcion))
                    filtro &= filtroBuilder.Regex(x => x.Descripcion, new BsonRegularExpression(where.Descripcion, "i"));

                if (!string.IsNullOrEmpty(where.SistemaAuxiliarId))
                    filtro &= filtroBuilder.Eq(x => x.SistemaAuxiliarId, where.SistemaAuxiliarId);

                if (where.FechaInicio.HasValue)
                    filtro &= filtroBuilder.Gte(x => x.FechaAsiento, where.FechaInicio.Value);

                if (where.FechaFin.HasValue)
                    filtro &= filtroBuilder.Lte(x => x.FechaAsiento, where.FechaFin.Value);

                if (!string.IsNullOrEmpty(where.TipoMovimiento))
                    filtro &= filtroBuilder.ElemMatch(x => x.Detalles, d => d.TipoMovimiento == where.TipoMovimiento);

                if (!string.IsNullOrEmpty(where.CuentaId))
                    filtro &= filtroBuilder.ElemMatch(x => x.Detalles, d => d.CuentaId == where.CuentaId);

                List<EntradaContable> resultados = await Context.EntradasContables.Find(filtro).ToListAsync();
                return Paginar(resultados, where);
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar Entradas Contables por parámetros; EX: {0}", ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        private void Validar(EntradaContable entrada)
        {
            if (string.IsNullOrWhiteSpace(entrada.Descripcion))
                throw new ArgumentException("La descripción es obligatoria y no puede estar vacía.");

            if (string.IsNullOrWhiteSpace(entrada.SistemaAuxiliarId) || !ObjectId.TryParse(entrada.SistemaAuxiliarId, out _))
                throw new ArgumentException("El SistemaAuxiliarId es obligatorio y debe ser un ObjectId válido.");

            var sistemaAuxiliar = Context.SistemasAuxiliares
                .Find(x => x.ObjectId == entrada.SistemaAuxiliarId).FirstOrDefault();
            if (sistemaAuxiliar == null)
                throw new ArgumentException("El sistema auxiliar especificado no existe.");

            if (entrada.Detalles == null || !entrada.Detalles.Any())
                throw new ArgumentException("Debe haber al menos un detalle en la entrada contable.");

            foreach (var detalle in entrada.Detalles)
            {
                if (string.IsNullOrWhiteSpace(detalle.CuentaId) || !ObjectId.TryParse(detalle.CuentaId, out _))
                    throw new ArgumentException("El CuentaId es obligatorio y debe ser un ObjectId válido.");

                var cuentaContable = Context.CuentasContables
                    .Find(x => x.ObjectId == detalle.CuentaId).FirstOrDefault();
                if (cuentaContable == null)
                    throw new ArgumentException("La cuenta contable especificada no existe.");

                if (!cuentaContable.PermiteTransacciones)
                    throw new ArgumentException("La cuenta contable seleccionada no permite transacciones.");

                if (detalle.TipoMovimiento != EntradaContableDetalle.TIPO_MOV_DEBITO &&
                    detalle.TipoMovimiento != EntradaContableDetalle.TIPO_MOV_CREDITO)
                    throw new ArgumentException("El tipo de movimiento debe ser 'DB' (débito) o 'CR' (crédito).");

                if (detalle.MontoAsiento <= 0)
                    throw new ArgumentException("El monto del asiento contable debe ser mayor a 0.");
            }

            if (entrada.FechaAsiento > DateTime.Now)
                throw new ArgumentException("La fecha del asiento contable no puede ser futura.");
        }

        public async Task CrearAsync(EntradaContable entrada)
        {
            try
            {
                Validar(entrada);
                entrada.Id = await GenerarNuevoIdAsync(Constantes.ENTIDAD_ENTRADA_CONTABLE);
                entrada.FechaCreacion = DateTime.Now;

                await Context.EntradasContables.InsertOneAsync(entrada);
                Logger.LogInformation("EntradaContable creada con Id: {Id}, ObjectId: {ObjectId}", entrada.Id, entrada.ObjectId);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al crear EntradaContable {0}\n EX: {1}", entrada, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<bool> ActualizarAsync(EntradaContable entrada)
        {
            try
            {
                Validar(entrada);
                entrada.FechaActualizacion = DateTime.Now;

                var resultado = await Context.EntradasContables.ReplaceOneAsync(
                    x => x.ObjectId == entrada.ObjectId,
                    entrada
                );

                bool actualizado = resultado.ModifiedCount > 0;
                if (actualizado)
                {
                    Logger.LogInformation("EntradaContable actualizada correctamente.");
                }
                else
                {
                    Logger.LogWarning("No se encontró EntradaContable con ObjectId: {ObjectId}", entrada.ObjectId);
                }

                return actualizado;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al actualizar EntradaContable {0}\n EX: {1}", entrada, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }
        #endregion
    }
}
