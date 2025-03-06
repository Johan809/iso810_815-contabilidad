using ContabilidadAPI.Model;
using MongoDB.Driver;

namespace ContabilidadAPI.Managers
{
    public abstract class AbstractManager<T>
    {
        #region Constructor
        protected readonly ILogger<T> Logger;
        protected readonly EntityContext Context;

        protected AbstractManager(EntityContext context, ILogger<T> logger)
        {
            Logger = logger;
            Context = context;
        }
        #endregion

        #region Metodos
        protected async Task<int> GenerarNuevoIdAsync(string entidad)
        {
            Logger.LogInformation("Generando nuevo Id para la entidad: {Entidad}", entidad);

            var filtro = Builders<Contador>.Filter.Eq(c => c.Entidad, entidad);
            var actualizacion = Builders<Contador>.Update.Inc(c => c.UltimoId, 1);
            var opciones = new FindOneAndUpdateOptions<Contador>
            {
                IsUpsert = true, // Crea el documento si no existe
                ReturnDocument = ReturnDocument.After
            };

            var resultado = await Context.Contadores.FindOneAndUpdateAsync(filtro, actualizacion, opciones);
            Logger.LogInformation("Nuevo Id generado para {Entidad}: {NuevoId}", entidad, resultado.UltimoId);

            return resultado.UltimoId;
        }

        protected List<T> Paginar<T>(List<T> lista, AbstractWhere where)
        {
            where.TotalRegistros = lista.Count;

            if (where.EsPaginable)
            {
                if (where.IndicePagina <= 0)
                    where.IndicePagina = 1;
                return lista.Skip((where.IndicePagina - 1) * where.CantidadPagina)
                    .Take(where.CantidadPagina).ToList();
            }
            else return lista;
        }
        #endregion
    }
}
