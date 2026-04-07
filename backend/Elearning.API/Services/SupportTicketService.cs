using Data.Dtos.SupportTicket;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class SupportTicketService : BaseService, ISupportTicketService
    {
        public SupportTicketService(DatabaseContext databaseContext) : base(databaseContext)
        {
        }

        public async Task CreateAsync(SupportTicketCreateDto dto, int userId)
        {
            SupportTicket ticket = new()
            {
                UserId = userId,                 // właściciel zgłoszenia = zalogowany user
                CourseId = dto.CourseId,
                Title = dto.Title!,
                Status = dto.Status!,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                ClosedAt = null
            };

            // jeśli zgłoszenie dotyczy kursu, spróbuj automatycznie przypisać tutora
            if (dto.CourseId.HasValue)
            {
                var courseInfo = await databaseContext.Courses
                    .Where(item => item.CourseId == dto.CourseId.Value && item.IsActive)
                    .Select(item => new
                    {
                        item.CourseId,
                        item.TutorUserId
                    })
                    .FirstOrDefaultAsync();

                if (courseInfo != null)
                {
                    ticket.AssignedTutorId = courseInfo.TutorUserId;
                }
            }

            databaseContext.SupportTickets.Add(ticket);
            await databaseContext.SaveChangesAsync();
        }

        public async Task EditAsync(SupportTicketEditDto dto)
        {
            SupportTicket ticket = databaseContext.SupportTickets
                .FirstOrDefault(item => item.SupportTicketId == dto.Id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego zgłoszenia o id {dto.Id}.");

            ticket.CourseId = dto.CourseId;
            ticket.AssignedTutorId = dto.AssignedTutorId;
            ticket.Title = dto.Title!;
            ticket.Status = dto.Status!;

            await databaseContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            SupportTicket ticket = databaseContext.SupportTickets
                .FirstOrDefault(item => item.SupportTicketId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego zgłoszenia o id {id}.");

            ticket.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<SupportTicketDto>> GetAllAsync()
        {
            List<SupportTicketDto> dtos = await databaseContext.SupportTickets
                .Where(item => item.IsActive)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new SupportTicketDto()
                {
                    Id = item.SupportTicketId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course != null ? item.Course.Title : null,
                    AssignedTutorId = item.AssignedTutorId,
                    AssignedTutorName = item.AssignedTutor!.UserProfile!.DisplayName,
                    Title = item.Title,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    ClosedAt = item.ClosedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<SupportTicketDto> GetAsync(int id)
        {
            SupportTicketDto dto = await databaseContext.SupportTickets
                .Where(item => item.IsActive && item.SupportTicketId == id)
                .Select(item => new SupportTicketDto()
                {
                    Id = item.SupportTicketId,
                    UserId = item.UserId,
                    UserName = item.User.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course != null ? item.Course.Title : null,
                    AssignedTutorId = item.AssignedTutorId,
                    AssignedTutorName = item.AssignedTutor!.UserProfile!.DisplayName,
                    Title = item.Title,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    ClosedAt = item.ClosedAt,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego zgłoszenia o id {id}.");

            return dto;
        }

        public async Task<List<SupportTicketDto>> GetForStudentAsync(int userId)
        {
            List<SupportTicketDto> dtos = await databaseContext.SupportTickets
                .Where(item => item.IsActive && item.UserId == userId)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new SupportTicketDto
                {
                    Id = item.SupportTicketId,
                    UserId = item.UserId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course != null ? item.Course.Title : null,
                    AssignedTutorId = item.AssignedTutorId,
                    Title = item.Title,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    ClosedAt = item.ClosedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<List<SupportTicketDto>> GetForTutorAsync(int tutorUserId)
        {
            List<SupportTicketDto> dtos = await databaseContext.SupportTickets
                .Where(item => item.IsActive && item.AssignedTutorId == tutorUserId)
                .OrderByDescending(item => item.CreatedAt)
                .Select(item => new SupportTicketDto
                {
                    Id = item.SupportTicketId,
                    UserId = item.UserId,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course != null ? item.Course.Title : null,
                    AssignedTutorId = item.AssignedTutorId,
                    Title = item.Title,
                    Status = item.Status,
                    CreatedAt = item.CreatedAt,
                    ClosedAt = item.ClosedAt,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }
    }
}
