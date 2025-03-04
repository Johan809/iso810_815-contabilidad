using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContabilidadAPI.Model
{
    public class CuentaContable
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
        [BsonRepresentation(BsonType.ObjectId)]
        public string TipoCuentaId { get; set; } = string.Empty;

        [BsonRequired]
        public bool PermiteTransacciones { get; set; } = true;

        [BsonRequired]
        //esto solo puede estar entre 1 y 3
        public int Nivel { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        public string? CuentaMayorId { get; set; }

        [BsonRequired]
        [BsonRepresentation(BsonType.Decimal128)]
        public decimal Balance { get; set; } = 0;

        public bool Estado { get; set; } = true;
        #endregion
    }
}
