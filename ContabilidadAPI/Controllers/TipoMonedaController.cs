using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoMonedaController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<TipoMonedaController> Logger;

        public TipoMonedaController(ContabilidadService service, ILogger<TipoMonedaController> logger)
        {
            Service = service;
            Logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var tipoMoneda = await Service.TipoMonedaManager.Buscar(id);
            if (tipoMoneda == null)
                return NotFound($"Tipo Moneda con Id: {id} no encontrado");

            return Ok(tipoMoneda);
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerTodos([FromQuery] TipoMoneda.Where where)
        {
            where = where ?? new TipoMoneda.Where();
            var lista = await Service.TipoMonedaManager.Buscar(where);
            return Ok(lista);
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] TipoMoneda.TMCrearDTO dto)
        {
            try
            {
                TipoMoneda tipoMoneda = new(dto);
                await Service.TipoMonedaManager.CrearAsync(tipoMoneda);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = tipoMoneda.Id }, tipoMoneda);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al crear TipoMoneda");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] TipoMoneda.TMEditarDTO dto)
        {
            try
            {
                TipoMoneda? tipoMoneda = await Service.TipoMonedaManager.Buscar(id);
                if (tipoMoneda is null)
                    return NotFound($"Tipo Moneda con Id: {id} no encontrado");

                tipoMoneda.CodigoISO = dto.CodigoISO ?? tipoMoneda.CodigoISO;
                tipoMoneda.Descripcion = dto.Descripcion ?? tipoMoneda.Descripcion;
                tipoMoneda.UltimaTasaCambiaria = dto.UltimaTasaCambiaria;
                tipoMoneda.Estado = dto.Estado;

                bool actualizado = await Service.TipoMonedaManager.ActualizarAsync(tipoMoneda);
                if (!actualizado)
                    return BadRequest($"Tipo Moneda con Id: {id} no pudo ser actualizado.");

                return Ok(actualizado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al Actualizar TipoMoneda");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }
    }
}
