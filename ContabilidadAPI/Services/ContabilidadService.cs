using ContabilidadAPI.Managers;
using ContabilidadAPI.Model;

namespace ContabilidadAPI.Service
{
    public class ContabilidadService
    {
        public TipoCuentaManager TipoCuentaManager { get; }
        public TipoMonedaManager TipoMonedaManager { get; }
        public SistemaAuxiliarManager SistemaAuxiliarManager { get; }
        public CuentaContableManager CuentaContableManager { get; }
        public EntradaContableManager EntradaContableManager { get; }
        public UsuarioAuxiliarManager UsuarioAuxiliarManager { get; }

        public ContabilidadService(EntityContext context, ILoggerFactory loggerFactory)
        {
            TipoCuentaManager = new TipoCuentaManager(context, loggerFactory.CreateLogger<TipoCuentaManager>());
            TipoMonedaManager = new TipoMonedaManager(context, loggerFactory.CreateLogger<TipoMonedaManager>());
            SistemaAuxiliarManager = new SistemaAuxiliarManager(context, loggerFactory
                .CreateLogger<SistemaAuxiliarManager>());
            CuentaContableManager = new CuentaContableManager(context, loggerFactory.CreateLogger<CuentaContableManager>());
            EntradaContableManager = new EntradaContableManager(context, loggerFactory.CreateLogger<EntradaContableManager>());
            UsuarioAuxiliarManager = new UsuarioAuxiliarManager(context, loggerFactory.CreateLogger<UsuarioAuxiliarManager>());
        }
    }
}
