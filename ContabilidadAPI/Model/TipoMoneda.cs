using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContabilidadAPI.Model
{
    public class TipoMoneda
    {
        #region Propiedades
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ObjectId { get; set; }

        [BsonElement("Identificador")]
        public int Id { get; set; }

        [BsonRequired]
        public string CodigoISO { get; set; } = "DOP";

        [BsonRequired]
        public string Descripcion { get; set; } = string.Empty;

        [BsonRequired]
        [BsonRepresentation(BsonType.Decimal128)] // Usar Decimal128 para precisión financiera
        public decimal UltimaTasaCambiaria { get; set; } = 1.00M;
        
        [BsonRepresentation(BsonType.Boolean)]
        public bool Estado { get; set; } = true;

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime FechaCreacion { get; set; }

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime FechaActualizacion { get; set; }
        #endregion

        #region Where
        public class Where : AbstractWhere
        {
            public int Id { get; set; }
            public bool? Estado { get; set; }
            public string? CodigoISO { get; set; }
            public string? Descripcion { get; set; }
        }
        #endregion
    }
}
