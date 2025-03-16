using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ContabilidadAPI.Managers
{
    public class UsuarioAuxiliarManager : AbstractManager<UsuarioAuxiliarManager>
    {
        #region Constructor
        public UsuarioAuxiliarManager(EntityContext context, ILogger<UsuarioAuxiliarManager> logger)
        : base(context, logger) { }
        #endregion

        #region Metodos
        public async Task<UsuarioAuxiliar?> Buscar(int id)
        {
            try
            {
                return await Context.UsuariosAuxiliares.Find(x => x.Id == id)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar UsuarioAuxiliar por Id: {0}; EX: {1}", id, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }


        public async Task<UsuarioAuxiliar?> Buscar(string objectId)
        {
            try
            {
                return await Context.UsuariosAuxiliares.Find(x => x.ObjectId == objectId)
                    .SingleOrDefaultAsync();
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar UsuarioAuxiliar por ObjectId: {0}; EX: {1}", objectId, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<List<UsuarioAuxiliar>> Buscar(UsuarioAuxiliar.Where where)
        {
            try
            {
                var filtroBuilder = Builders<UsuarioAuxiliar>.Filter;
                var filtro = filtroBuilder.Empty;

                if (where.Id > 0)
                    filtro &= filtroBuilder.Eq(x => x.Id, where.Id);

                if (!string.IsNullOrEmpty(where.Nombre))
                    filtro &= filtroBuilder.Regex(x => x.Nombre, new BsonRegularExpression(where.Nombre, "i"));

                if (!string.IsNullOrEmpty(where.Email))
                    filtro &= filtroBuilder.Regex(x => x.Email, new BsonRegularExpression(where.Email, "i"));

                if (where.Estado.HasValue)
                    filtro &= filtroBuilder.Eq(x => x.Estado, where.Estado.Value);

                if (where.SistemaAuxiliarIdSec > 0)
                {
                    var sistemaAuxiliar = await Context.SistemasAuxiliares.Find(x => x.Id == where.SistemaAuxiliarIdSec).FirstOrDefaultAsync();
                    if (sistemaAuxiliar != null)
                        filtro &= filtroBuilder.Eq(x => x.SistemaAuxiliarId, sistemaAuxiliar.ObjectId);
                }

                List<UsuarioAuxiliar> resultados = await Context.UsuariosAuxiliares
                    .Find(filtro).ToListAsync();
                return Paginar(resultados, where);
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al buscar UsuarioAuxiliar por parámetros; EX: {0}", ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        private async Task Validar(UsuarioAuxiliar usuarioAuxiliar, bool esNuevo = true)
        {
            if (string.IsNullOrWhiteSpace(usuarioAuxiliar.Nombre))
                throw new ArgumentException("El nombre es obligatorio y no puede estar vacío.");

            if (string.IsNullOrWhiteSpace(usuarioAuxiliar.Email))
                throw new ArgumentException("El email es obligatorio y no puede estar vacío.");

            var nombreExiste = await Context.UsuariosAuxiliares.Find(x => x.Nombre == usuarioAuxiliar.Nombre && x.ObjectId != usuarioAuxiliar.ObjectId).AnyAsync();
            if (nombreExiste)
                throw new ArgumentException("Este nombre ya está en uso por otro usuario.");

            var emailExiste = await Context.UsuariosAuxiliares.Find(x => x.Email == usuarioAuxiliar.Email && x.ObjectId != usuarioAuxiliar.ObjectId).AnyAsync();
            if (emailExiste)
                throw new ArgumentException("El email ya está en uso por otro usuario.");

            if (string.IsNullOrWhiteSpace(usuarioAuxiliar.SistemaAuxiliarId) || !ObjectId.TryParse(usuarioAuxiliar.SistemaAuxiliarId, out _))
                throw new ArgumentException("El SistemaAuxiliarId es obligatorio y debe ser un ObjectId válido.");

            var sistemaAuxiliar = await Context.SistemasAuxiliares.Find(x => x.ObjectId == usuarioAuxiliar.SistemaAuxiliarId).FirstOrDefaultAsync();
            if (sistemaAuxiliar == null)
                throw new ArgumentException("El SistemaAuxiliar especificado no existe.");

            if (esNuevo && string.IsNullOrWhiteSpace(usuarioAuxiliar.ContrasenaHash))
                throw new ArgumentException("La contraseña es obligatoria para nuevos usuarios.");
        }

        public async Task CrearAsync(UsuarioAuxiliar usuario)
        {
            try
            {
                usuario.ContrasenaHash = SeguridadHelper.EncriptarContrasena(usuario.ContrasenaHash);
                await Validar(usuario);
                usuario.Id = await GenerarNuevoIdAsync(Constantes.ENTIDAD_USUARIO_AUXILIAR);
                usuario.FechaCreacion = DateTime.Now;
                await Context.UsuariosAuxiliares.InsertOneAsync(usuario);
                Logger.LogInformation("UsuarioAuxiliar creado con Id: {Id}, ObjectId: {ObjectId}", usuario.Id, usuario.ObjectId);
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al crear UsuarioAuxiliar {0}\n EX: {1}", usuario, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<bool> ActualizarAsync(UsuarioAuxiliar usuarioAuxiliar)
        {
            try
            {
                await Validar(usuarioAuxiliar, esNuevo: false);
                usuarioAuxiliar.FechaActualizacion = DateTime.Now;

                var resultado = await Context.UsuariosAuxiliares.ReplaceOneAsync(
                    x => x.ObjectId == usuarioAuxiliar.ObjectId,
                    usuarioAuxiliar
                );

                bool actualizado = resultado.ModifiedCount > 0;
                if (actualizado)
                {
                    Logger.LogInformation("UsuarioAuxiliar actualizado correctamente.");
                }
                else
                {
                    Logger.LogWarning("No se encontró UsuarioAuxiliar con ObjectId: {ObjectId}", usuarioAuxiliar.ObjectId);
                }

                return actualizado;
            }
            catch (ArgumentException)
            {
                throw;
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al actualizar UsuarioAuxiliar {0}\n EX: {1}", usuarioAuxiliar, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }

        public async Task<(UsuarioAuxiliar? Usuario, bool AccesoValido)> VerificarCredenciales(string email, string password)
        {
            try
            {
                var usuario = await Context.UsuariosAuxiliares
                    .Find(x => x.Email == email).FirstOrDefaultAsync();
                if (usuario == null)
                    return (null, false);

                usuario._SistemaId = Context.SistemasAuxiliares
                    .FindSync(sa => sa.ObjectId == usuario.ObjectId)
                    .FirstOrDefault()?.Id;

                bool accesoValido = SeguridadHelper.CompararContrasena(password, usuario.ContrasenaHash);
                if (accesoValido)
                {
                    usuario.UltimoAcceso = DateTime.Now;
                    _ = ActualizarAsync(usuario);
                }

                return (usuario, accesoValido);
            }
            catch (Exception ex)
            {
                Logger.LogError("Error al verificar credenciales del usuario con email {0}; EX: {1}", email, ex);
                throw new Exception(Constantes.ERROR_SERVIDOR);
            }
        }
        #endregion
    }
}
