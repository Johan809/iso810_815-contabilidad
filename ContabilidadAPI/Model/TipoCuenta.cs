using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Runtime.Serialization;

namespace ContabilidadAPI.Model
{
    public class TipoCuenta
    {
        #region Constantes
        public enum TipoOrigen
        {
            [EnumMember(Value = "DB")]
            Debito,
            [EnumMember(Value = "CR")]
            Credito
        }
        #endregion

        #region Propiedades
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ObjectId { get; set; }

        [BsonElement("Identificador")]
        public int Id { get; set; }

        [BsonRequired]
        public string Descripcion { get; set; } = "";

        [BsonRequired]
        [BsonRepresentation(BsonType.String)]
        public TipoOrigen Origen { get; set; }

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
            public string? Descripcion { get; set; }
            public string? Origen { get; set; }
        }
        #endregion
    }
}
