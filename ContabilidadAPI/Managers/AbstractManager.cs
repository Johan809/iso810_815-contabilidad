using ContabilidadAPI.Lib;
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
            var filtro = Builders<Contador>.Filter.Eq(c => c.Entidad, entidad);
            var actualizacion = Builders<Contador>.Update.Inc(c => c.UltimoId, 1);
            var opciones = new FindOneAndUpdateOptions<Contador>
            {
                IsUpsert = true, // Crea el documento si no existe
                ReturnDocument = ReturnDocument.After
            };

            var resultado = await Context.Contadores.FindOneAndUpdateAsync(filtro, actualizacion, opciones);
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

        public async Task<ResumenSistemaDTO> ObtenerResumenSistemaAsync()
        {
            try
            {
                var cuentasContables = await Context.CuentasContables.CountDocumentsAsync(_ => true); 
                var tipoMonedas = await Context.TipoMonedas.CountDocumentsAsync(_ => true); 
                var tipoCuentas = await Context.TipoCuentas.CountDocumentsAsync(_ => true); 
                var sistemasAuxiliares = await Context.SistemasAuxiliares.CountDocumentsAsync(_ => true);

                return new ResumenSistemaDTO
                {
                    TotalCuentasContables = cuentasContables,
                    TotalTipoMonedas = tipoMonedas,
                    TotalTipoCuentas = tipoCuentas,
                    TotalSistemasAuxiliares = sistemasAuxiliares
                };
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al obtener resumen del sistema: {0}", ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }
        #endregion
    }
}
