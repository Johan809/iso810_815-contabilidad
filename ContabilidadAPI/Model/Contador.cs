using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ContabilidadAPI.Model
{
    public class Contador
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ObjectId { get; set; }

        [BsonElement("Entidad")]
        public string Entidad { get; set; } = string.Empty;

        [BsonElement("UltimoId")]
        public int UltimoId { get; set; }
    }
}
