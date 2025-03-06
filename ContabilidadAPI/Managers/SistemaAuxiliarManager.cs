using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ContabilidadAPI.Managers
{
    public class SistemaAuxiliarManager : AbstractManager<SistemaAuxiliarManager>
    {
        #region Constructor
        public SistemaAuxiliarManager(EntityContext context, ILogger<SistemaAuxiliarManager> logger)
            : base(context, logger) { }
        #endregion

        #region Metodos
        public async Task<SistemaAuxiliar?> Buscar(int id)
        {
            try
            {
                return await Context.SistemasAuxiliares.Find(x => x.Id == id)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar SistemaAuxiliar por Id: {0}; EX: {1}", id, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<SistemaAuxiliar?> Buscar(string objectId)
        {
            try
            {
                return await Context.SistemasAuxiliares.Find(x => x.ObjectId == objectId)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar SistemaAuxiliar por ObjectId: {0}; EX: {1}", objectId, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<List<SistemaAuxiliar>> Buscar(SistemaAuxiliar.Where where)
        {
            try
            {
                var filtroBuilder = Builders<SistemaAuxiliar>.Filter;
                var filtro = filtroBuilder.Empty;

                if (!string.IsNullOrEmpty(where.Descripcion))
                    filtro &= filtroBuilder.Regex(x => x.Descripcion, new BsonRegularExpression(where.Descripcion, "i"));

                if (where.Estado.HasValue)
                    filtro &= filtroBuilder.Eq(x => x.Estado, where.Estado.Value);

                List<SistemaAuxiliar> resultados = await Context.SistemasAuxiliares.Find(filtro).ToListAsync();
                return Paginar(resultados, where);
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar SistemaAuxiliar por parámetros; EX: {0}", ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        private void Validar(SistemaAuxiliar sistemaAuxiliar)
        {
            if (string.IsNullOrWhiteSpace(sistemaAuxiliar.Descripcion))
                throw new ArgumentException("La descripción es obligatoria.");
        }

        public async Task CrearAsync(SistemaAuxiliar sistemaAuxiliar)
        {
            try
            {
                Validar(sistemaAuxiliar);
                sistemaAuxiliar.Id = await GenerarNuevoIdAsync(Constantes.ENTIDAD_SISTEMA_AUXILIAR);
                sistemaAuxiliar.FechaCreacion = DateTime.Now;
                await Context.SistemasAuxiliares.InsertOneAsync(sistemaAuxiliar);
                Logger.LogInformation("SistemaAuxiliar creado con Id: {Id}, ObjectId: {ObjectId}", sistemaAuxiliar.Id, sistemaAuxiliar.ObjectId);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al crear SistemaAuxiliar {0}\n EX: {1}", sistemaAuxiliar, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<bool> ActualizarAsync(SistemaAuxiliar sistemaAuxiliar)
        {
            try
            {
                Validar(sistemaAuxiliar);
                sistemaAuxiliar.FechaActualizacion = DateTime.Now;

                var resultado = await Context.SistemasAuxiliares.ReplaceOneAsync(
                    x => x.ObjectId == sistemaAuxiliar.ObjectId,
                    sistemaAuxiliar
                );

                bool actualizado = resultado.ModifiedCount > 0;
                if (actualizado)
                {
                    Logger.LogInformation("SistemaAuxiliar actualizado correctamente.");
                }
                else
                {
                    Logger.LogWarning("No se encontró SistemaAuxiliar con ObjectId: {ObjectId}", sistemaAuxiliar.ObjectId);
                }

                return actualizado;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al actualizar SistemaAuxiliar {0}\n EX: {1}", sistemaAuxiliar, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }
        #endregion
    }
}
