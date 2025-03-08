using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;

namespace ContabilidadAPI.Model
{
    public class TipoMoneda
    {
        #region Constructor
        public TipoMoneda() { }

        public TipoMoneda(BaseDTO dto)
        {
            CodigoISO = dto.CodigoISO ?? "DOP";
            Descripcion = dto.Descripcion ?? string.Empty;
            UltimaTasaCambiaria = dto.UltimaTasaCambiaria;
            Estado = true;
        }
        #endregion

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
        public DateTime? FechaActualizacion { get; set; } = null;
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

        #region DTO
        public abstract class BaseDTO
        {
            public string? CodigoISO { get; set; }
            public string? Descripcion { get; set; }
            public decimal UltimaTasaCambiaria { get; set; } = 1.00M;
        }

        [DisplayName("DTO_Crear_TipoMoneda")]
        public class TMCrearDTO : BaseDTO { }

        [DisplayName("DTO_Editar_TipoMoneda")]
        public class TMEditarDTO : BaseDTO
        {
            public string? ObjectId { get; set; }
            public int Id { get; set; }
            public bool Estado { get; set; } = true;
        }
        #endregion
    }
}
