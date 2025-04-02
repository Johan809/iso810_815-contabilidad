namespace ContabilidadAPI.Lib
{
    public static class SeguridadHelper
    {
        /// <summary>
        /// Encripta una contraseña usando BCrypt.
        /// </summary>
        /// <param name="password">Contraseña en texto plano.</param>
        /// <returns>Hash de la contraseña.</returns>
        public static string EncriptarContrasena(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        /// <summary>
        /// Compara una contraseña en texto plano con un hash almacenado.
        /// </summary>
        /// <param name="password">Contraseña en texto plano.</param>
        /// <param name="hashedPassword">Hash de la contraseña almacenado.</param>
        /// <returns>True si coinciden, False en caso contrario.</returns>
        public static bool CompararContrasena(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
