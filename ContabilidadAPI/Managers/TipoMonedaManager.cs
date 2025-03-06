using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ContabilidadAPI.Managers
{
    public class TipoMonedaManager : AbstractManager<TipoMonedaManager>
    {
        #region Constructor
        public TipoMonedaManager(EntityContext context, ILogger<TipoMonedaManager> logger)
           : base(context, logger) { }
        #endregion

        #region Metodos
        public async Task<TipoMoneda?> Buscar(int id)
        {
            try
            {
                return await Context.TipoMonedas.Find(x => x.Id == id)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar TipoMoneda por Id: {0}; EX: {1}", id, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<TipoMoneda?> Buscar(string objectId)
        {
            try
            {
                return await Context.TipoMonedas.Find(x => x.ObjectId == objectId)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar TipoMoneda por ObjectId: {0}; EX: {1}", objectId, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<List<TipoMoneda>> Buscar(TipoMoneda.Where where)
        {
            try
            {
                var filtroBuilder = Builders<TipoMoneda>.Filter;
                var filtro = filtroBuilder.Empty;

                if (where.Id > 0)
                    filtro &= filtroBuilder.Eq(x => x.Id, where.Id);

                if (where.Estado.HasValue)
                    filtro &= filtroBuilder.Eq(x => x.Estado, where.Estado.Value);

                if (!string.IsNullOrEmpty(where.CodigoISO))
                    filtro &= filtroBuilder.Regex(x => x.CodigoISO, new BsonRegularExpression(where.CodigoISO, "i"));

                if (!string.IsNullOrEmpty(where.Descripcion))
                    filtro &= filtroBuilder.Regex(x => x.Descripcion, new BsonRegularExpression(where.Descripcion, "i"));

                List<TipoMoneda> resultados = await Context.TipoMonedas.Find(filtro).ToListAsync();
                return Paginar(resultados, where);
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar TipoMoneda por parámetros; EX: {0}", ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        private void Validar(TipoMoneda tipoMoneda)
        {
            if (string.IsNullOrWhiteSpace(tipoMoneda.CodigoISO) || tipoMoneda.CodigoISO.Length != 3)
                throw new ArgumentException("El Código ISO debe tener exactamente 3 caracteres.");

            if (string.IsNullOrWhiteSpace(tipoMoneda.Descripcion))
                throw new ArgumentException("La descripción es obligatoria.");

            if (tipoMoneda.UltimaTasaCambiaria <= 0)
                throw new ArgumentException("La tasa cambiaria debe ser mayor a 0.");
        }

        public async Task CrearAsync(TipoMoneda tipoMoneda)
        {
            try
            {
                Validar(tipoMoneda);
                tipoMoneda.Id = await GenerarNuevoIdAsync(Constantes.ENTIDAD_TIPO_MONEDA);
                tipoMoneda.FechaCreacion = DateTime.Now;
                await Context.TipoMonedas.InsertOneAsync(tipoMoneda);
                Logger.LogInformation("TipoMoneda creado con Id: {Id}, ObjectId: {ObjectId}", tipoMoneda.Id, tipoMoneda.ObjectId);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al crear TipoMoneda {0}\n EX: {1}", tipoMoneda, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<bool> ActualizarAsync(TipoMoneda tipoMoneda)
        {
            try
            {
                Validar(tipoMoneda);
                tipoMoneda.FechaActualizacion = DateTime.Now;

                var resultado = await Context.TipoMonedas.ReplaceOneAsync(
                    x => x.ObjectId == tipoMoneda.ObjectId,
                    tipoMoneda
                );

                bool actualizado = resultado.ModifiedCount > 0;
                if (actualizado)
                {
                    Logger.LogInformation("TipoMoneda actualizado correctamente.");
                }
                else
                {
                    Logger.LogWarning("No se encontró TipoMoneda con ObjectId: {ObjectId}", tipoMoneda.ObjectId);
                }

                return actualizado;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al actualizar TipoMoneda {0}\n EX: {1}", tipoMoneda, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }
        #endregion
    }
}
