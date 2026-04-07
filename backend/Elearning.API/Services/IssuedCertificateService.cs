using Data.Dtos.IssuedCertificate;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Elearning.API.Models;
using Elearning.API.Models.Contexts;
using Elearning.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Services
{
    public class IssuedCertificateService : BaseService, IIssuedCertificateService
    {
        private readonly IWebHostEnvironment env;
        public IssuedCertificateService(DatabaseContext databaseContext, IWebHostEnvironment env) : base(databaseContext)
        {
            this.env = env;
        }

        public async Task DeleteAsync(int id)
        {
            IssuedCertificate certificate = databaseContext.IssuedCertificates
                .FirstOrDefault(item => item.IssuedCertificateId == id && item.IsActive)
                ?? throw new Exception($"Nie odnaleziono aktywnego certyfikatu o id {id}.");

            certificate.IsActive = false;

            await databaseContext.SaveChangesAsync();
        }

        public async Task<List<IssuedCertificateDto>> GetAllAsync()
        {
            List<IssuedCertificateDto> dtos = await databaseContext.IssuedCertificates
                .Where(item => item.IsActive)
                .Select(item => new IssuedCertificateDto()
                {
                    Id = item.IssuedCertificateId,
                    UserId = item.UserId,
                    UserName = item.User!.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course!.Title,
                    CertificateTemplateId = item.CertificateTemplateId,
                    CertificateTemplateName = item.CertificateTemplate!.Name,
                    IssuedAt = item.IssuedAt,
                    CertificateNumber = item.CertificateNumber,
                    FileUrl = item.FileUrl,
                    IsActive = item.IsActive
                })
                .ToListAsync();

            return dtos;
        }

        public async Task<IssuedCertificateDto> GetAsync(int id)
        {
            IssuedCertificateDto dto = await databaseContext.IssuedCertificates
                .Where(item => item.IsActive && item.IssuedCertificateId == id)
                .Select(item => new IssuedCertificateDto()
                {
                    Id = item.IssuedCertificateId,
                    UserId = item.UserId,
                    UserName = item.User!.UserProfile!.DisplayName!,
                    CourseId = item.CourseId,
                    CourseTitle = item.Course!.Title,
                    CertificateTemplateId = item.CertificateTemplateId,
                    CertificateTemplateName = item.CertificateTemplate!.Name,
                    IssuedAt = item.IssuedAt,
                    CertificateNumber = item.CertificateNumber,
                    FileUrl = item.FileUrl,
                    IsActive = item.IsActive
                })
                .FirstOrDefaultAsync()
                ?? throw new Exception($"Nie odnaleziono aktywnego certyfikatu o id {id}.");

            return dto;
        }

        //główna metoda do pobrania certyfikatu 
        public async Task<(byte[] FileBytes, string FileName)> DownloadForUserAsync(int courseId, int userId)
        {
            bool hasCompletedCourse = await databaseContext.UserCourseEnrollments
                .AnyAsync(item =>
                    item.IsActive &&
                    item.UserId == userId &&
                    item.CourseId == courseId &&
                    item.Status == "Completed"
                );

            if (!hasCompletedCourse)
                throw new Exception("Użytkownik nie ukończył tego kursu i nie może wygenerować certyfikatu.");

            IssuedCertificate? cert = await databaseContext.IssuedCertificates
                .FirstOrDefaultAsync(item =>
                    item.IsActive &&
                    item.UserId == userId &&
                    item.CourseId == courseId
                );

            if (cert != null && !string.IsNullOrWhiteSpace(cert.FileUrl))
            {
                var existingPath = Path.Combine(
                    env.WebRootPath,
                    cert.FileUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
                );

                if (File.Exists(existingPath))
                {
                    var bytes = await File.ReadAllBytesAsync(existingPath);
                    var name = Path.GetFileName(existingPath);
                    return (bytes, name);
                }

                cert.FileUrl = null;
            }

            CertificateTemplate? activeTemplate = await databaseContext.CertificateTemplates
                .FirstOrDefaultAsync(item => item.IsActive);

            if (activeTemplate == null)
                throw new Exception("Brak dostępnych szablonów certyfikatów.");

            if (cert == null)
            {
                cert = new IssuedCertificate
                {
                    UserId = userId,
                    CourseId = courseId,
                    CertificateTemplateId = activeTemplate.CertificateTemplateId,
                    IssuedAt = DateTime.UtcNow,
                    CertificateNumber = GenerateCertificateNumber(),
                    IsActive = true,
                    FileUrl = null
                };

                databaseContext.IssuedCertificates.Add(cert);
                await databaseContext.SaveChangesAsync();
            }

            var user = await databaseContext.Users
                .Include(u => u.UserProfile)
                .FirstAsync(u => u.UserId == userId);

            var course = await databaseContext.Courses
                .FirstAsync(c => c.CourseId == courseId);

            var studentName =
                user.UserProfile?.DisplayName
                ?? $"User#{user.UserId}";

            var tokens = new Dictionary<string, string>
            {
                ["{{StudentName}}"] = studentName,
                ["{{CourseTitle}}"] = course.Title,
                ["{{IssuedAt}}"] = cert.IssuedAt.ToString("yyyy-MM-dd"),
                ["{{CertificateNumber}}"] = cert.CertificateNumber
            };

            byte[] templateBytes;
            try
            {
                templateBytes = Convert.FromBase64String(activeTemplate.TemplateBody);
            }
            catch
            {
                throw new Exception("TemplateBody nie jest poprawnym Base64 DOCX. Upewnij się, że zapisujesz plik .docx jako Base64.");
            }

            byte[] outputBytes = FillDocxTemplate(templateBytes, tokens);

            var folder = Path.Combine(env.WebRootPath, "uploads", "certificates");
            Directory.CreateDirectory(folder);

            var fileName = $"{cert.CertificateNumber}.docx";
            var fullPath = Path.Combine(folder, fileName);
            await File.WriteAllBytesAsync(fullPath, outputBytes);

            cert.FileUrl = $"/uploads/certificates/{fileName}";
            cert.CertificateTemplateId = activeTemplate.CertificateTemplateId;
            await databaseContext.SaveChangesAsync();

            return (outputBytes, fileName);
        }

        private static byte[] FillDocxTemplate(byte[] templateDocxBytes, Dictionary<string, string> tokens)
        {
            using var ms = new MemoryStream();
            ms.Write(templateDocxBytes, 0, templateDocxBytes.Length);

            using (var doc = WordprocessingDocument.Open(ms, true))
            {
                foreach (var kv in tokens)
                {
                    ReplaceTokenInDocument(doc, kv.Key, kv.Value ?? "");
                }

                doc.MainDocumentPart!.Document.Save();
            }

            return ms.ToArray();
        }

        private static void ReplaceTokenInDocument(WordprocessingDocument doc, string token, string value)
        {
            foreach (var p in doc.MainDocumentPart!.Document.Body!.Descendants<Paragraph>())
            {
                var texts = p.Descendants<Text>().ToList();
                if (texts.Count == 0) continue;

                var combined = string.Concat(texts.Select(t => t.Text));
                if (!combined.Contains(token)) continue;

                combined = combined.Replace(token, value);

                int pos = 0;
                for (int i = 0; i < texts.Count; i++)
                {
                    int len = texts[i].Text.Length;
                    if (pos + len > combined.Length) len = Math.Max(0, combined.Length - pos);

                    texts[i].Text = len > 0 ? combined.Substring(pos, len) : "";
                    pos += texts[i].Text.Length;
                }

                if (pos < combined.Length)
                    texts[^1].Text += combined.Substring(pos);
            }
        }


        private string GenerateCertificateNumber()
        {
            return $"CERT-{Guid.NewGuid():N}".ToUpper();
        }


    }
}
