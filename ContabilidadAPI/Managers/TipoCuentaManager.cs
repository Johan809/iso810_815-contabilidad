using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ContabilidadAPI.Managers
{
    public class TipoCuentaManager : AbstractManager<TipoCuentaManager>
    {
        #region Constructor
        public TipoCuentaManager(EntityContext context, ILogger<TipoCuentaManager> logger)
            : base(context, logger) { }
        #endregion

        #region Metodos
        public async Task<TipoCuenta?> Buscar(int id)
        {
            try
            {
                return await Context.TipoCuentas.Find(x => x.Id == id)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar TipoCuenta por Id: {0}; EX: {1}", id, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<TipoCuenta?> Buscar(string objectId)
        {
            try
            {
                return await Context.TipoCuentas.Find(x => x.ObjectId == objectId)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar TipoCuenta por ObjectId: {0}; EX: {1}", objectId, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<List<TipoCuenta>> Buscar(TipoCuenta.Where where)
        {
            try
            {
                var filtroBuilder = Builders<TipoCuenta>.Filter;
                var filtro = filtroBuilder.Empty;

                if (where.Id > 0)
                    filtro &= filtroBuilder.Eq(x => x.Id, where.Id);

                if (where.Estado.HasValue)
                    filtro &= filtroBuilder.Eq(x => x.Estado, where.Estado.Value);

                if (!string.IsNullOrEmpty(where.Descripcion))
                    filtro &= filtroBuilder.Regex(x => x.Descripcion, new BsonRegularExpression(where.Descripcion, "i"));

                if (!string.IsNullOrEmpty(where.Origen))
                    filtro &= filtroBuilder.Regex(x => x.Origen, new BsonRegularExpression(where.Descripcion, "i"));

                List<TipoCuenta> resultados = await Context.TipoCuentas.Find(filtro).ToListAsync();
                return [.. Paginar(resultados, where).OrderBy(tc => tc.Id)];
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar TipoCuenta por parametros; EX: {0}", ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        private void Validar(TipoCuenta tipoCuenta)
        {
            if (string.IsNullOrWhiteSpace(tipoCuenta.Descripcion))
                throw new ArgumentException("La descripción es obligatoria.");

            if (tipoCuenta.Origen != TipoCuenta.TIPO_ORIGEN_CREDITO &&
                tipoCuenta.Origen != TipoCuenta.TIPO_ORIGEN_DEBITO)
                throw new ArgumentException("El origen no es válido.");
        }

        public async Task CrearAsync(TipoCuenta tipoCuenta)
        {
            try
            {
                Validar(tipoCuenta);
                tipoCuenta.Id = await GenerarNuevoIdAsync(Constantes.ENTIDAD_TIPO_CUENTA);
                tipoCuenta.FechaCreacion = DateTime.Now;
                await Context.TipoCuentas.InsertOneAsync(tipoCuenta);
                Logger.LogInformation("TipoCuenta creado con Id: {Id}, ObjectId: {ObjectId}", tipoCuenta.Id, tipoCuenta.ObjectId);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al crear TipoCuenta {0}\n EX: {1}", tipoCuenta, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<bool> ActualizarAsync(TipoCuenta tipoCuenta)
        {
            try
            {
                Validar(tipoCuenta);
                tipoCuenta.FechaActualizacion = DateTime.Now;

                var resultado = await Context.TipoCuentas.ReplaceOneAsync(
                    x => x.ObjectId == tipoCuenta.ObjectId,
                    tipoCuenta
                );

                bool actualizado = resultado.ModifiedCount > 0;
                if (actualizado)
                {
                    Logger.LogInformation("TipoCuenta actualizado correctamente.");
                }
                else
                {
                    Logger.LogWarning("No se encontró TipoCuenta con ObjectId: {ObjectId}", tipoCuenta.ObjectId);
                }

                return actualizado;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al actualizar TipoCuenta {0}\n EX: {1}", tipoCuenta, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }
        #endregion
    }
}
