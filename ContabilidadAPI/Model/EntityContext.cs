using ContabilidadAPI.Lib;
using MongoDB.Driver;

namespace ContabilidadAPI.Model
{
    public class EntityContext
    {
        private readonly IMongoDatabase _database;

        public EntityContext(IConfiguration configuration)
        {
            string? connectionString = configuration.GetConnectionString("MongoConnection");
            MongoClient mongoClient = new MongoClient(connectionString);
            _database = mongoClient.GetDatabase(configuration["MongoDB:DatabaseName"]);
        }

        //Colecciones
        public IMongoCollection<Contador> Contadores => _database.GetCollection<Contador>(Constantes.ENTIDAD_CONTADOR);
        public IMongoCollection<TipoCuenta> TipoCuentas => _database.GetCollection<TipoCuenta>(Constantes.ENTIDAD_TIPO_CUENTA);
        public IMongoCollection<TipoMoneda> TipoMonedas => _database.GetCollection<TipoMoneda>(Constantes.ENTIDAD_TIPO_MONEDA);
        public IMongoCollection<SistemaAuxiliar> SistemasAuxiliares => _database.GetCollection<SistemaAuxiliar>(Constantes.ENTIDAD_SISTEMA_AUXILIAR);
        public IMongoCollection<CuentaContable> CuentasContables => _database.GetCollection<CuentaContable>(Constantes.ENTIDAD_CUENTA_CONTABLE);
        public IMongoCollection<EntradaContable> EntradasContables => _database.GetCollection<EntradaContable>(Constantes.ENTIDAD_ENTRADA_CONTABLE);
    }

    public abstract class AbstractWhere
    {
        public bool EsPaginable { get; set; } = true;
        public int IndicePagina { get; set; } = 1;
        public int CantidadPagina { get; set; } = 15;
        public int TotalRegistros { get; set; }

    }
}
