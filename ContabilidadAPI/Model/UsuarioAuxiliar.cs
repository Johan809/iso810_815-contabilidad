using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel;

namespace ContabilidadAPI.Model
{
    public class UsuarioAuxiliar
    {
        #region Propiedades
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? ObjectId { get; set; }

        [BsonElement("Identificador")]
        public int Id { get; set; }

        [BsonRequired]
        public string Nombre { get; set; } = string.Empty;

        [BsonRequired]
        public string ContrasenaHash { get; set; } = string.Empty;

        [BsonRequired]
        public string Email { get; set; } = string.Empty;

        [BsonRequired]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? SistemaAuxiliarId { get; set; }

        [BsonRepresentation(BsonType.Boolean)]
        public bool Estado { get; set; } = true;

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? UltimoAcceso { get; set; } = null;

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime FechaCreacion { get; set; }

        [BsonRepresentation(BsonType.DateTime)]
        public DateTime? FechaActualizacion { get; set; } = null;

        [BsonIgnore]
        public string? ResetToken { get; set; }

        [BsonIgnore]
        public int? _SistemaId;
        #endregion

        #region Where
        public class Where : AbstractWhere
        {
            public int Id { get; set; }
            public string? Nombre { get; set; }
            public string? Email { get; set; }
            public bool? Estado { get; set; }
            /// <summary>
            /// NOTA: El identificador, no el ObjectId
            /// </summary>
            public int SistemaAuxiliarIdSec { get; set; }
        }
        #endregion

        #region DTO
        public abstract class BaseUsuarioAuxiliarDTO
        {
            public string Nombre { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public int SistemaAuxiliarId { get; set; }
        }

        [DisplayName("DTO_Crear_UsuarioAuxiliar")]
        public class UA_CrearDTO : BaseUsuarioAuxiliarDTO
        {
            public string Password { get; set; } = string.Empty;
        }

        [DisplayName("DTO_Editar_UsuarioAuxiliar")]
        public class UA_EditarDTO : BaseUsuarioAuxiliarDTO
        {
            public bool Estado { get; set; }
        }

        [DisplayName("DTO_Listar_UsuarioAuxiliar")]
        public class UA_ListarDTO : BaseUsuarioAuxiliarDTO
        {
            public int Id { get; set; }
            public bool Estado { get; set; }
            public DateTime? UltimoAcceso { get; set; }
        }

        [DisplayName("DTO_Login_UsuarioAuxiliar")]
        public class UA_LoginDTO
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
        #endregion
    }
}
