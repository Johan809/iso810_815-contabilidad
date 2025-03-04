using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContabilidadAPI.Model
{
    public class SistemaAuxiliar
    {
        #region Propiedades
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ObjectId { get; set; }

        [BsonElement("Identificador")]
        public int Id { get; set; }

        [BsonRequired]
        public string Descripcion { get; set; } = "";

        public bool Estado { get; set; } = true;
        #endregion
    }
}
