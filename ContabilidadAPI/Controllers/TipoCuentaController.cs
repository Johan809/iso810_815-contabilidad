using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace ContabilidadAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TipoCuentaController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<TipoCuentaController> Logger;

        public TipoCuentaController(ContabilidadService service, ILogger<TipoCuentaController> logger)
        {
            Service = service;
            Logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var tipoCuenta = await Service.TipoCuentaManager.Buscar(id);
            if (tipoCuenta == null)
                return NotFound($"Tipo Cuenta con Id: {id} no encontrado");

            return Ok(tipoCuenta);
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos([FromQuery] TipoCuenta.Where where)
        {
            where = where ?? new TipoCuenta.Where();
            var lista = await Service.TipoCuentaManager.Buscar(where);
            return Ok(lista);
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] TipoCuenta.TCCrearDTO dto)
        {
            try
            {
                TipoCuenta tipoCuenta = new(dto);
                await Service.TipoCuentaManager.CrearAsync(tipoCuenta);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = tipoCuenta.Id }, tipoCuenta);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al crear TipoCuenta");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] TipoCuenta.TCEditarDTO dto)
        {
            try
            {
                TipoCuenta? tipoCuenta = await Service.TipoCuentaManager.Buscar(id);
                if (tipoCuenta is null)
                    return NotFound($"Tipo Cuenta con Id: {id} no encontrado");

                tipoCuenta.Descripcion = dto.Descripcion;
                tipoCuenta.Estado = dto.Estado;
                tipoCuenta.Origen = dto.Origen;

                bool actualizado = await Service.TipoCuentaManager.ActualizarAsync(tipoCuenta);
                if (!actualizado)
                    return BadRequest($"Tipo Cuenta con Id: {id} no pudo ser actualizado.");

                return Ok(actualizado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al Actualizar TipoCuenta");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }
    }
}
