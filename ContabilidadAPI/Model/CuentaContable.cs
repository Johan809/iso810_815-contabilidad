using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;

namespace ContabilidadAPI.Model
{
    public class CuentaContable
    {
        #region Constructor
        public CuentaContable() { }

        public CuentaContable(BaseDTO dto)
        {
            //TipoCuenta y CuentaMayor se settean de otra forma
            Descripcion = dto.Descripcion;
            PermiteTransacciones = dto.PermiteTransacciones;
            Nivel = dto.Nivel;
            Balance = dto.Balance;
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

        [BsonRepresentation(BsonType.Boolean)]
        public bool Estado { get; set; } = true;

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime FechaCreacion { get; set; }

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? FechaActualizacion { get; set; }
        #endregion

        #region Where
        public class Where : AbstractWhere
        {
            public int Id { get; set; }
            public string? Descripcion { get; set; }
            public int? Nivel { get; set; }
            public bool? Estado { get; set; }
            public string? CuentaMayorId { get; set; }
        }
        #endregion

        #region DTO
        public abstract class BaseDTO
        {
            public string Descripcion { get; set; } = string.Empty;
            public int TipoCuentaId { get; set; }
            public bool PermiteTransacciones { get; set; } = true;
            public int Nivel { get; set; }
            public decimal Balance { get; set; } = 0;
            public int? CuentaMayorId { get; set; }
        }

        [DisplayName("DTO_Crear_CuentaContable")]
        public class CC_CrearDTO : BaseDTO { }

        [DisplayName("DTO_Editar_CuentaContable")]
        public class CC_EditarDTO : BaseDTO
        {
            public bool Estado { get; set; }
        }
        #endregion
    }
}
