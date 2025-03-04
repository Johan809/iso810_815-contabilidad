using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContabilidadAPI.Model
{
    public class EntradaContable
    {
        #region Constantes
        public const string TIPO_MOV_DEBITO = "DB";
        public const string TIPO_MOV_DEBITO_LABEL = "Débito";
        public const string TIPO_MOV_CREDITO = "CR";
        public const string TIPO_MOV_CREDITO_LABEL = "Crédito";
        #endregion

        #region Propiedades
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ObjectId { get; set; }

        [BsonElement("Identificador")]
        public int Id { get; set; }

        [BsonRequired]
        public string Descripcion { get; set; } = string.Empty;

        [BsonRequired]
        [BsonRepresentation(BsonType.ObjectId)]
        public string SistemaAuxiliarId { get; set; } = string.Empty;

        [BsonRequired]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CuentaId { get; set; } = string.Empty;

        [BsonRequired]
        public string TipoMovimiento { get; set; } = TIPO_MOV_DEBITO;

        public string TipoMovimientoDesc
        {
            get
            {
                return TipoMovimiento switch
                {
                    TIPO_MOV_CREDITO => TIPO_MOV_CREDITO_LABEL,
                    TIPO_MOV_DEBITO => TIPO_MOV_DEBITO_LABEL,
                    _ => string.Empty,
                };
            }
        }

        [BsonRequired]
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime FechaAsiento { get; set; } = DateTime.Now;

        [BsonRequired]
        [BsonRepresentation(BsonType.Decimal128)]
        public decimal MontoAsiento { get; set; } = 0.00M;

        public bool Estado { get; set; } = true;
        #endregion
    }
}
