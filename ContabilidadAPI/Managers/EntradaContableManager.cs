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

            if (entrada.Detalles == null || entrada.Detalles.Count < 2)
                throw new ArgumentException("Debe haber al menos dos detalles en la entrada contable.");

            // Contadores para validar los tipos de movimiento y sumatorias
            int cantidadDebitos = 0, cantidadCreditos = 0;
            decimal sumatoriaDebitos = 0, sumatoriaCreditos = 0;
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

                // Contamos los tipos de movimientos y sumamos montos
                if (detalle.TipoMovimiento == EntradaContableDetalle.TIPO_MOV_DEBITO)
                {
                    cantidadDebitos++;
                    sumatoriaDebitos += detalle.MontoAsiento;
                }
                else if (detalle.TipoMovimiento == EntradaContableDetalle.TIPO_MOV_CREDITO)
                {
                    cantidadCreditos++;
                    sumatoriaCreditos += detalle.MontoAsiento;
                }
            }

            // Validar que haya al menos un débito y un crédito
            if (cantidadDebitos == 0)
                throw new ArgumentException("Debe haber al menos un detalle de tipo 'DB' (débito).");

            if (cantidadCreditos == 0)
                throw new ArgumentException("Debe haber al menos un detalle de tipo 'CR' (crédito).");

            // Validar que la sumatoria de débitos sea igual a la sumatoria de créditos
            if (sumatoriaDebitos != sumatoriaCreditos)
                throw new ArgumentException("La sumatoria de los montos en 'DB' (débito) debe ser igual a la sumatoria en 'CR' (crédito).");

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
                entrada.Detalles.ForEach(d =>
                {
                    d.ObjectId ??= ObjectId.GenerateNewId().ToString();
                });

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
                entrada.Detalles.ForEach(d =>
                {
                    d.ObjectId ??= ObjectId.GenerateNewId().ToString();
                });

                var filtro = Builders<EntradaContable>.Filter.Eq(x => x.ObjectId, entrada.ObjectId);
                var actualizacion = Builders<EntradaContable>.Update
                    .Set(x => x.Descripcion, entrada.Descripcion)
                    .Set(x => x.FechaAsiento, entrada.FechaAsiento)
                    .Set(x => x.Estado, entrada.Estado)
                    .Set(x => x.SistemaAuxiliarId, entrada.SistemaAuxiliarId)
                    .Set(x => x.FechaActualizacion, entrada.FechaActualizacion)
                    .Set(x => x.Detalles, entrada.Detalles); // Se sobrescriben los detalles

                var resultado = await Context.EntradasContables.UpdateOneAsync(filtro, actualizacion);

                bool actualizado = resultado.ModifiedCount > 0;
                if (actualizado)
                {
                    Logger.LogInformation("EntradaContable con Id {Id} actualizada correctamente.", entrada.Id);
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
