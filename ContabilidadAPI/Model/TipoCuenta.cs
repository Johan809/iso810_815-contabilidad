using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;
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
        public const string TIPO_ORIGEN_DEBITO = "DB";
        public const string TIPO_ORIGEN_DEBITO_LABEL = "Débito";
        public const string TIPO_ORIGEN_CREDITO = "CR";
        public const string TIPO_ORIGEN_CREDITO_LABEL = "Crédito";
        #endregion

        #region Constructor
        public TipoCuenta() { }

        public TipoCuenta(BaseDTO dto)
        {
            Descripcion = dto.Descripcion;
            Origen = dto.Origen;
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
        public string Descripcion { get; set; } = "";

        [BsonRequired]
        [BsonRepresentation(BsonType.String)]
        public string? Origen { get; set; }

        [BsonIgnore]
        public string OrigenDesc
        {
            get
            {
                switch (Origen)
                {
                    case TIPO_ORIGEN_DEBITO:
                        return TIPO_ORIGEN_DEBITO_LABEL;
                    case TIPO_ORIGEN_CREDITO:
                        return TIPO_ORIGEN_CREDITO_LABEL;
                    default:
                        return string.Empty;
                }
            }
        }

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
            public string? Descripcion { get; set; }
            public string? Origen { get; set; }
        }
        #endregion

        #region DTO
        public abstract class BaseDTO
        {
            public string Descripcion { get; set; } = "";
            public string? Origen { get; set; }
        }

        [DisplayName("DTO_Crear_TipoCuenta")]
        public class TCCrearDTO : BaseDTO { }

        [DisplayName("DTO_Editar_TipoCuenta")]
        public class TCEditarDTO : BaseDTO
        {
            public string? ObjectId { get; set; }
            public int Id { get; set; }
            public bool Estado { get; set; } = true;
        }
        #endregion
    }
}
