using ContabilidadAPI.Lib;
using ContabilidadAPI.Model;
using ContabilidadAPI.Service;
using Microsoft.AspNetCore.Mvc;
using static ContabilidadAPI.Model.EntradaContable;

namespace ContabilidadAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntradaContableController : ControllerBase
    {
        private readonly ContabilidadService Service;
        private readonly ILogger<EntradaContableController> Logger;

        public EntradaContableController(ContabilidadService service, ILogger<EntradaContableController> logger)
        {
            Logger = logger;
            Service = service;
        }

        [ApiAuthorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var entradaContable = await Service.EntradaContableManager.Buscar(id);
            if (entradaContable is null)
                return NotFound($"Entrada Contable con Id: {id} no encontrada");
            var dto = await ConvertirADTOAsync(entradaContable);
            return Ok(dto);
        }

        [HttpGet]
        [ApiAuthorize]
        public async Task<IActionResult> ObtenerTodos([FromQuery] EntradaContable.Where where)
        {
            where ??= new EntradaContable.Where();
            UsuarioLogin usuario = GetUsuarioLogin();
            if (usuario.SistemaId != SistemaAuxiliar.CONTABILIDAD)
            {
                where.SistemaAuxiliarId = usuario.SistemaId;
            }
            var lista = await Service.EntradaContableManager.Buscar(where);
            var listaDTO = new List<object>();
            foreach (var entrada in lista)
            {
                var dto = await ConvertirADTOAsync(entrada);
                listaDTO.Add(dto);
            }

            return Ok(listaDTO);
        }

        [HttpPost]
        [ApiAuthorize]
        public async Task<IActionResult> Crear([FromBody] EntradaContable.EC_Crear_DTO dto)
        {
            try
            {
                UsuarioLogin usuario = GetUsuarioLogin();
                if (dto.Detalles is null || dto.Detalles.Count < 2)
                    return BadRequest("Debe haber al menos dos detalles en la entrada contable.");

                EntradaContable entradaContable = new(dto);
                entradaContable.SistemaAuxiliarId = usuario.SistemaId;

                var cuentasAfectadas = await Service.CuentaContableManager
                    .Buscar(new CuentaContable.Where()
                    {
                        Estado = true,
                        IdList = dto.Detalles.Select(d => d.CuentaId).ToList(),
                    });
                foreach (var d in dto.Detalles)
                {
                    EntradaContableDetalle detalle = new()
                    {
                        MontoAsiento = d.MontoAsiento,
                        TipoMovimiento = d.TipoMovimiento ?? string.Empty,
                        CuentaId = cuentasAfectadas
                            .FirstOrDefault(c => c.Id == d.CuentaId)
                                ?.ObjectId ?? string.Empty,
                    };
                    entradaContable.Detalles.Add(detalle);
                }

                await Service.EntradaContableManager.CrearAsync(entradaContable);
                var idArg = new { id = entradaContable.Id };
                return CreatedAtAction(nameof(ObtenerPorId), idArg, entradaContable);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al crear EntradaContable");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        [ApiAuthorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] EntradaContable.EC_Editar_DTO dto)
        {
            try
            {
                UsuarioLogin usuario = GetUsuarioLogin();
                EntradaContable? entradaContable = await Service.EntradaContableManager.Buscar(id);
                if (entradaContable is null)
                    return NotFound($"Entrada Contable con Id: {id} no encontrada");
                if (dto.Detalles is null || dto.Detalles.Count < 2)
                    return BadRequest("Debe haber al menos dos detalles en la entrada contable.");

                entradaContable.Descripcion = dto.Descripcion;
                entradaContable.FechaAsiento = dto.FechaAsiento;
                entradaContable.Estado = dto.Estado ?? entradaContable.Estado;
                entradaContable.SistemaAuxiliarId = usuario.SistemaId;

                var cuentasAfectadas = await Service.CuentaContableManager
                    .Buscar(new CuentaContable.Where()
                    {
                        Estado = true,
                        IdList = dto.Detalles.Select(d => d.CuentaId).ToList(),
                    });
                List<EntradaContableDetalle> nuevosDetalle = [];
                foreach (var d in dto.Detalles)
                {
                    EntradaContableDetalle detalle = new()
                    {
                        MontoAsiento = d.MontoAsiento,
                        TipoMovimiento = d.TipoMovimiento ?? string.Empty,
                        CuentaId = cuentasAfectadas
                            .FirstOrDefault(c => c.Id == d.CuentaId)
                                ?.ObjectId ?? string.Empty,
                    };
                    nuevosDetalle.Add(detalle);
                }
                entradaContable.Detalles = nuevosDetalle;

                bool actualizado = await Service.EntradaContableManager
                    .ActualizarAsync(entradaContable);
                if (!actualizado)
                    return BadRequest($"Entrada Contable con Id: {id} no pudo ser actualizada.");

                return Ok(entradaContable);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error al actualizar EntradaContable");
                return StatusCode(500, Constantes.ERROR_SERVIDOR);
            }
        }

        private async Task<EntradaContableDTO> ConvertirADTOAsync(EntradaContable entrada)
        {
            var dto = new EntradaContableDTO
            {
                Id = entrada.Id,
                Descripcion = entrada.Descripcion,
                FechaAsiento = entrada.FechaAsiento,
                Estado = entrada.Estado,
                EstadoDesc = entrada.EstadoDesc,
                Detalles = new List<EntradaContableDetalle.DetalleDTO>()
            };

            var sistema = await Service.SistemaAuxiliarManager.Buscar(entrada.SistemaAuxiliarId);
            dto.SistemaAuxiliarId = sistema?.Id ?? 0;

            var cuentasIds = entrada.Detalles.Select(d => d.CuentaId).Distinct().ToList();
            var cuentas = await Service.CuentaContableManager.Buscar(cuentasIds);

            foreach (var detalle in entrada.Detalles)
            {
                var cuenta = cuentas.FirstOrDefault(c => c.ObjectId == detalle.CuentaId);
                dto.Detalles.Add(new EntradaContableDetalle.DetalleDTO
                {
                    CuentaId = cuenta?.Id ?? 0,
                    TipoMovimiento = detalle.TipoMovimiento,
                    MontoAsiento = detalle.MontoAsiento
                });
            }

            return dto;
        }

        private UsuarioLogin GetUsuarioLogin()
        {
            return (UsuarioLogin)HttpContext.Items[Constantes.USUARIO]!;
        }
    }
}
