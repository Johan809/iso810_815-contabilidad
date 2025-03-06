using ContabilidadAPI.Managers;
using ContabilidadAPI.Model;

namespace ContabilidadAPI.Service
{
    public class ContabilidadService
    {
        public TipoCuentaManager TipoCuentaManager { get; }
        public TipoMonedaManager TipoMonedaManager { get; }

        public ContabilidadService(EntityContext context, ILoggerFactory loggerFactory)
        {
            TipoCuentaManager = new TipoCuentaManager(context, loggerFactory.CreateLogger<TipoCuentaManager>());
            TipoMonedaManager = new TipoMonedaManager(context, loggerFactory.CreateLogger<TipoMonedaManager>());
        }
    }
}
