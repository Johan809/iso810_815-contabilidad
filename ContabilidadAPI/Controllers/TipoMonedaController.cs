using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoMonedaController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<TipoMonedaController> Logger;
        private readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

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
                return BadRequest(new { mensaje = ex.Message });
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

                return Ok(tipoMoneda);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al Actualizar TipoMoneda");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [HttpPost("{id}/actualizar-tasa")]
        public async Task<IActionResult> ActualizarTasaCambio(int id)
        {
            try
            {
                TipoMoneda? tipoMoneda = await Service.TipoMonedaManager.Buscar(id);
                if (tipoMoneda is null)
                    return NotFound($"Tipo Moneda con Id: {id} no encontrado");

                using (HttpClient client = new HttpClient())
                {
                    string url = $"https://ws-public-ms.ambitioustree-0fda82fa.westus2.azurecontainerapps.io/api/exchange-rate?currencyCode={tipoMoneda.CodigoISO}";
                    HttpResponseMessage response = await client.GetAsync(url);

                    if (!response.IsSuccessStatusCode)
                        return BadRequest($"No se pudo obtener la tasa de cambio para {tipoMoneda.CodigoISO}");

                    var content = await response.Content.ReadAsStringAsync();
                    var tasaCambio = JsonSerializer.Deserialize<ExchangeRateResponse>(content, _jsonOptions);

                    if (tasaCambio == null)
                        return BadRequest("Respuesta inválida del servicio de tasa de cambio");

                    tipoMoneda.UltimaTasaCambiaria = tasaCambio.Rate;

                    bool actualizado = await Service.TipoMonedaManager.ActualizarAsync(tipoMoneda);
                    if (!actualizado)
                        return BadRequest($"Tipo Moneda con Id: {id} no pudo ser actualizado.");

                    return Ok(tipoMoneda);
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al actualizar tasa de cambio para TipoMoneda");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        private class ExchangeRateResponse
        {
            [JsonPropertyName("id")]
            public int Id { get; set; }

            [JsonPropertyName("currencyCode")]
            public string CurrencyCode { get; set; } = string.Empty;

            [JsonPropertyName("rate")]
            public decimal Rate { get; set; }
        }

    }
}
