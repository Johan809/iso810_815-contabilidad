using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SistemaAuxiliarController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<SistemaAuxiliarController> Logger;

        public SistemaAuxiliarController(ContabilidadService service, ILogger<SistemaAuxiliarController> logger)
        {
            Service = service;
            Logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var sistemaAuxiliar = await Service.SistemaAuxiliarManager.Buscar(id);
            if (sistemaAuxiliar == null)
                return NotFound($"Sistema Auxiliar con Id: {id} no encontrado");

            return Ok(sistemaAuxiliar);
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos([FromQuery] SistemaAuxiliar.Where where)
        {
            where = where ?? new SistemaAuxiliar.Where();
            var lista = await Service.SistemaAuxiliarManager.Buscar(where);
            return Ok(lista);
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] SistemaAuxiliar.SACrearDTO dto)
        {
            try
            {
                SistemaAuxiliar sistemaAuxiliar = new(dto);
                await Service.SistemaAuxiliarManager.CrearAsync(sistemaAuxiliar);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = sistemaAuxiliar.Id }, sistemaAuxiliar);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al crear SistemaAuxiliar");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] SistemaAuxiliar.SAEditarDTO dto)
        {
            try
            {
                SistemaAuxiliar? sistemaAuxiliar = await Service.SistemaAuxiliarManager.Buscar(id);
                if (sistemaAuxiliar is null)
                    return NotFound($"Sistema Auxiliar con Id: {id} no encontrado");

                sistemaAuxiliar.Descripcion = dto.Descripcion;
                sistemaAuxiliar.Estado = dto.Estado;

                bool actualizado = await Service.SistemaAuxiliarManager.ActualizarAsync(sistemaAuxiliar);
                if (!actualizado)
                    return BadRequest($"Sistema Auxiliar con Id: {id} no pudo ser actualizado.");

                return Ok(actualizado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al actualizar SistemaAuxiliar");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }
    }
}
