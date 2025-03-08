using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;

namespace ContabilidadAPI.Model
{
    public class EntradaContable
    {
        #region Constantes
        public const string ESTADO_REGISTRADO = "R";
        public const string ESTADO_REGISTRADO_LABEL = "Registrado";
        public const string ESTADO_CANCELADO = "C";
        public const string ESTADO_CANCELADO_LABEL = "Cancelado";
        #endregion

        #region Constructor
        public EntradaContable() { }

        public EntradaContable(BaseDTO dto)
        {
            Descripcion = dto.Descripcion;
            FechaAsiento = dto.FechaAsiento;
            Estado = ESTADO_REGISTRADO;
            Detalles = [];
        }
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
        [BsonRepresentation(BsonType.DateTime)]
        public DateTime FechaAsiento { get; set; } = DateTime.Now;

        [BsonElement("Estado")]
        [BsonRepresentation(BsonType.String)]
        public string Estado { get; set; } = ESTADO_REGISTRADO;

        [BsonRequired]
        public List<EntradaContableDetalle> Detalles { get; set; } = new();

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime FechaCreacion { get; set; }

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? FechaActualizacion { get; set; }

        [BsonIgnore]
        public string EstadoDesc
        {
            get
            {
                return Estado switch
                {
                    ESTADO_REGISTRADO => ESTADO_REGISTRADO_LABEL,
                    ESTADO_CANCELADO => ESTADO_CANCELADO_LABEL,
                    _ => string.Empty,
                };
            }
        }
        #endregion

        #region Where
        public class Where : AbstractWhere
        {
            public int Id { get; set; }
            public string? Descripcion { get; set; }
            public string? TipoMovimiento { get; set; }
            public string? CuentaId { get; set; }
            public DateTime? FechaInicio { get; set; }
            public DateTime? FechaFin { get; set; }
            public string? SistemaAuxiliarId { get; set; }
        }
        #endregion

        #region DTO
        public abstract class BaseDTO
        {
            public string Descripcion { get; set; } = string.Empty;
            public int SistemaAuxiliarId { get; set; }
            public DateTime FechaAsiento { get; set; } = DateTime.Now;
            public List<EntradaContableDetalle.DetalleDTO>? Detalles { get; set; }
        }

        [DisplayName("DTO_Crear_EntradaContable")]
        public class EC_Crear_DTO : BaseDTO { }

        [DisplayName("DTO_Editar_EntradaContable")]
        public class EC_Editar_DTO : BaseDTO
        {
            public string? Estado { get; set; }
        }
        #endregion
    }

    public class EntradaContableDetalle
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

        [BsonRequired]
        public string TipoMovimiento { get; set; } = TIPO_MOV_DEBITO;

        [BsonRequired]
        public string CuentaId { get; set; } = string.Empty;

        [BsonRequired]
        public decimal MontoAsiento { get; set; } = 0.00M;

        [BsonIgnore]
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
        #endregion

        #region DTO
        public class DetalleDTO
        {
            public int CuentaId { get; set; }
            public string? TipoMovimiento { get; set; }
            public decimal MontoAsiento { get; set; }
        }
        #endregion
    }
}
