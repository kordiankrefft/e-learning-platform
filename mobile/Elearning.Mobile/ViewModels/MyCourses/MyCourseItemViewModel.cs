using System.ComponentModel;
using System.Globalization;
using System.Runtime.CompilerServices;
using Elearning.Mobile.Dtos.Course;
using Elearning.Mobile.Dtos.UserCourseAccess;
using Elearning.Mobile.Dtos.UserCourseEnrollment;
using Elearning.Mobile.Services;

namespace Elearning.Mobile.ViewModels.MyCourses;

public class MyCourseItemViewModel : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    public UserCourseEnrollmentDto Enrollment { get; }
    public CourseDto? Course { get; }
    public UserCourseAccessDto? Access { get; }

    public string? ImageUrl { get; private set; }
    public bool HasImage => !string.IsNullOrWhiteSpace(ImageUrl);

    public string Title => Course?.Title ?? $"Kurs ID: {Enrollment.CourseId}";
    public string StatusText => $"Status: {Enrollment.Status}";
    public string CompletedAtText => FormatDatePl(Enrollment.CompletedAt) ?? "—";

    public string AccessStartText => FormatDatePl(Access?.AccessStart) ?? "—";
    public string AccessEndText =>
        string.IsNullOrWhiteSpace(Access?.AccessEnd)
            ? "bez limitu"
            : (FormatDatePl(Access?.AccessEnd) ?? "—");

    public bool HasAccess
    {
        get
        {
            if (Access == null || !Access.IsActive || Access.IsRevoked)
                return false;

            var now = DateTime.UtcNow;

            if (TryParseDate(Access.AccessStart, out var start) && start.ToUniversalTime() > now)
                return false;

            if (!string.IsNullOrWhiteSpace(Access.AccessEnd) &&
                TryParseDate(Access.AccessEnd, out var end) &&
                end.ToUniversalTime() < now)
                return false;

            return true;
        }
    }

    public bool ShowNoAccessWarning => !HasAccess;

    private bool? _passedFinalQuiz;
    public bool? PassedFinalQuiz
    {
        get => _passedFinalQuiz;
        set
        {
            if (_passedFinalQuiz == value) return;
            _passedFinalQuiz = value;

            OnPropertyChanged();
            OnPropertyChanged(nameof(CanComplete));
            OnPropertyChanged(nameof(ShowCheckPassedInfo));
            OnPropertyChanged(nameof(ShowNeedQuizHint));
            OnPropertyChanged(nameof(CompleteButtonBg));
            OnPropertyChanged(nameof(CompleteButtonTextColor));
        }
    }

    public bool ShowCheckPassedInfo =>
        HasAccess &&
        Enrollment.Status != "Completed" &&
        PassedFinalQuiz == null;

    public bool ShowNeedQuizHint =>
        HasAccess &&
        Enrollment.Status != "Completed" &&
        PassedFinalQuiz == false;

    public bool CanComplete =>
        HasAccess &&
        Enrollment.Status != "Completed" &&
        PassedFinalQuiz == true;

    public Color CompleteButtonBg =>
        CanComplete ? Color.FromArgb("#FACC15") : Color.FromArgb("#3A3A3A");

    public Color CompleteButtonTextColor =>
        CanComplete ? Colors.Black : Color.FromArgb("#9CA3AF");

    private bool _isCompleting;
    public bool IsCompleting
    {
        get => _isCompleting;
        set
        {
            if (_isCompleting == value) return;
            _isCompleting = value;
            OnPropertyChanged();
        }
    }

    public MyCourseItemViewModel(
        UserCourseEnrollmentDto enrollment,
        CourseDto? course,
        UserCourseAccessDto? access)
    {
        Enrollment = enrollment;
        Course = course;
        Access = access;

        BuildImageUrl();
    }

    private void BuildImageUrl()
    {
        var path = Course?.ThumbnailUrl;

        if (string.IsNullOrWhiteSpace(path))
            return;

        if (path.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            ImageUrl = path;
        else if (path.StartsWith("/"))
            ImageUrl = $"{ApiClient.PublicBaseUrl}{path}";
        else
            ImageUrl = $"{ApiClient.PublicBaseUrl}/{path}";

        OnPropertyChanged(nameof(ImageUrl));
        OnPropertyChanged(nameof(HasImage));
    }

    public void MarkCompletedLocally()
    {
        Enrollment.Status = "Completed";
        Enrollment.CompletedAt ??= DateTime.UtcNow.ToString("o");

        OnPropertyChanged(nameof(StatusText));
        OnPropertyChanged(nameof(CompletedAtText));
        OnPropertyChanged(nameof(CanComplete));
        OnPropertyChanged(nameof(CompleteButtonBg));
        OnPropertyChanged(nameof(CompleteButtonTextColor));
    }

    private static string? FormatDatePl(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return null;
        if (!TryParseDate(raw, out var dt)) return raw;

        return dt.ToLocalTime()
            .ToString("dd.MM.yyyy, HH:mm:ss", new CultureInfo("pl-PL"));
    }

    private static bool TryParseDate(string? raw, out DateTime dt)
        => DateTime.TryParse(
            raw,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AssumeUniversal,
            out dt);

    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}