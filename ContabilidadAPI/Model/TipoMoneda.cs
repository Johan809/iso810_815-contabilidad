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
        public string Descripcion { get; set; } = string.Empty;

        [BsonRequired]
        [BsonRepresentation(BsonType.Decimal128)] // Usar Decimal128 para precisión financiera
        public decimal UltimaTasaCambiaria { get; set; } = 1.00M;

        public bool Estado { get; set; } = true;
        #endregion
    }
}
