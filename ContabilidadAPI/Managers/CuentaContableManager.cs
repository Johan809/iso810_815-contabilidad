using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ContabilidadAPI.Managers
{
    public class CuentaContableManager : AbstractManager<CuentaContableManager>
    {
        #region Constructor
        public CuentaContableManager(EntityContext context, ILogger<CuentaContableManager> logger)
            : base(context, logger) { }
        #endregion

        #region Metodos
        public async Task<CuentaContable?> Buscar(int id)
        {
            try
            {
                return await Context.CuentasContables.Find(x => x.Id == id)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar CuentaContable por Id: {0}; EX: {1}", id, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<CuentaContable?> Buscar(string objectId)
        {
            try
            {
                return await Context.CuentasContables.Find(x => x.ObjectId == objectId)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar CuentaContable por ObjectId: {0}; EX: {1}", objectId, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<List<CuentaContable>> Buscar(List<string> objectidList)
        {
            try
            {
                if (objectidList == null || objectidList.Count == 0)
                    return [];

                var filtro = Builders<CuentaContable>.Filter.In(x => x.ObjectId, objectidList);
                return await Context.CuentasContables.Find(filtro).ToListAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar CuentaContable por ObjectIdList: {0}; EX: {1}", objectidList, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<List<CuentaContable>> Buscar(CuentaContable.Where where)
        {
            try
            {
                var filtroBuilder = Builders<CuentaContable>.Filter;
                var filtro = filtroBuilder.Empty;

                if (where.Id > 0)
                    filtro &= filtroBuilder.Eq(x => x.Id, where.Id);

                if (where.IdList != null && where.IdList.Count > 0)
                    filtro &= filtroBuilder.In(x => x.Id, where.IdList);

                if (!string.IsNullOrEmpty(where.Descripcion))
                    filtro &= filtroBuilder.Regex(x => x.Descripcion, new BsonRegularExpression(where.Descripcion, "i"));

                if (where.Nivel.HasValue)
                    filtro &= filtroBuilder.Eq(x => x.Nivel, where.Nivel.Value);

                if (!string.IsNullOrEmpty(where.CuentaMayorId))
                    filtro &= filtroBuilder.Eq(x => x.CuentaMayorId, where.CuentaMayorId);

                if (where.Estado.HasValue)
                    filtro &= filtroBuilder.Eq(x => x.Estado, where.Estado.Value);

                List<CuentaContable> resultados = await Context.CuentasContables.Find(filtro).ToListAsync();
                return Paginar(resultados, where);
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar CuentaContable por parámetros; EX: {0}", ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        private void Validar(CuentaContable cuentaContable)
        {
            if (string.IsNullOrWhiteSpace(cuentaContable.Descripcion))
                throw new ArgumentException("La descripción es obligatoria y no puede estar vacía.");

            if (string.IsNullOrWhiteSpace(cuentaContable.TipoCuentaId)
                || !ObjectId.TryParse(cuentaContable.TipoCuentaId, out _))
                throw new ArgumentException("El TipoCuentaId es obligatorio y debe ser un ObjectId válido.");

            if (!string.IsNullOrWhiteSpace(cuentaContable.CuentaMayorId)
                && !ObjectId.TryParse(cuentaContable.CuentaMayorId, out _))
                throw new ArgumentException("El CuentaMayorId debe ser un ObjectId válido si se proporciona.");

            if (cuentaContable.Nivel < 1 || cuentaContable.Nivel > 3)
                throw new ArgumentException("El nivel debe estar entre 1 y 3.");

            if (cuentaContable.Balance < 0)
                throw new ArgumentException("El balance no puede ser negativo.");

            if (!string.IsNullOrEmpty(cuentaContable.CuentaMayorId))
            {
                var cuentaMayor = Context.CuentasContables.Find(x => x.ObjectId == cuentaContable.CuentaMayorId)
                    .FirstOrDefault();
                if (cuentaMayor == null)
                    throw new ArgumentException("La cuenta mayor no existe.");

                if (cuentaMayor.Nivel >= cuentaContable.Nivel)
                    throw new ArgumentException("El nivel de la cuenta contable debe ser mayor al de su cuenta mayor.");
            }
        }

        public async Task CrearAsync(CuentaContable cuentaContable)
        {
            try
            {
                Validar(cuentaContable);
                cuentaContable.Id = await GenerarNuevoIdAsync(Constantes.ENTIDAD_CUENTA_CONTABLE);
                cuentaContable.FechaCreacion = DateTime.Now;
                await Context.CuentasContables.InsertOneAsync(cuentaContable);
                Logger.LogInformation("CuentaContable creada con Id: {Id}, ObjectId: {ObjectId}", cuentaContable.Id, cuentaContable.ObjectId);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al crear CuentaContable {0}\n EX: {1}", cuentaContable, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<bool> ActualizarAsync(CuentaContable cuentaContable)
        {
            try
            {
                Validar(cuentaContable);
                cuentaContable.FechaActualizacion = DateTime.Now;

                var resultado = await Context.CuentasContables.ReplaceOneAsync(
                    x => x.ObjectId == cuentaContable.ObjectId,
                    cuentaContable
                );

                bool actualizado = resultado.ModifiedCount > 0;
                if (actualizado)
                {
                    Logger.LogInformation("CuentaContable actualizada correctamente.");
                }
                else
                {
                    Logger.LogWarning("No se encontró CuentaContable con ObjectId: {ObjectId}", cuentaContable.ObjectId);
                }

                return actualizado;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al actualizar CuentaContable {0}\n EX: {1}", cuentaContable, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }
        #endregion
    }
}
