using System.Diagnostics;
using System.Security.Claims;
using Data.Dtos.AuditLog;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Middleware
{
    public class AuditLoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public AuditLoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAuditLogService auditLogService, DatabaseContext databaseContext)
        {
            var path = context.Request.Path.Value ?? string.Empty;
            if (path.StartsWith("/swagger") || path.StartsWith("/health"))
            {
                await _next(context);
                return;
            }

            var stopwatch = Stopwatch.StartNew();

            // przepuszczamy dalej request (kontrolery, inne middleware itp.)
            await _next(context);

            stopwatch.Stop();

            var request = context.Request;
            var response = context.Response;

            int? userId = null;
            string? identityUserId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrWhiteSpace(identityUserId))
            {
                var user = await databaseContext.Users
                    .Where(u => u.IsActive && u.IdentityUserId == identityUserId)
                    .Select(u => new { u.UserId })
                    .FirstOrDefaultAsync();

                userId = user?.UserId;
            }

            var routeData = context.GetRouteData();
            string? controllerName = routeData?.Values["controller"]?.ToString();
            string? actionName = routeData?.Values["action"]?.ToString();
            string? entityIdFromRoute = routeData?.Values["id"]?.ToString();

            var dto = new AuditLogCreateDto
            {
                UserId = userId,
                ActionType = $"{request.Method} {response.StatusCode}",
                EntityName = controllerName ?? path,
                EntityId = entityIdFromRoute ?? "-",
                Details =
                    $"Path={path}; Action={actionName};" +
                    $"ElapsedMs={stopwatch.ElapsedMilliseconds}"
            };

            try
            {
                await auditLogService.CreateAsync(dto);
            }
            catch
            {
                // bez wyjątków z audytu – logowanie nie może wywalić API
            }
        }
    }
}
