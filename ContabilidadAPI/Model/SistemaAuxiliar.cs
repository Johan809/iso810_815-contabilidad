using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel;

namespace ContabilidadAPI.Model
{
    public class SistemaAuxiliar
    {
        #region Constructor
        public SistemaAuxiliar() { }

        public SistemaAuxiliar(BaseDTO dto)
        {
            Descripcion = dto.Descripcion;
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
            public string? Descripcion { get; set; }
            public bool? Estado { get; set; }
        }
        #endregion

        #region DTO
        public abstract class BaseDTO
        {
            public string Descripcion { get; set; } = "";
        }

        [DisplayName("DTO_Crear_SistemaAuxiliar")]
        public class SACrearDTO : BaseDTO { }

        [DisplayName("DTO_Editar_SistemaAuxiliar")]
        public class SAEditarDTO : BaseDTO
        {
            public bool Estado { get; set; } = true;
        }
        #endregion
    }
}
