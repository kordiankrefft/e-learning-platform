using System;
using System.Threading.Tasks;
using System.Windows.Input;

namespace Elearning.Mobile.Models;

public class ModuleCardModel
{
    public int ModuleId { get; set; }
    public int OrderIndex { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }

    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public bool IsUnlocked { get; set; }

    public string OrderBadge => $"#{OrderIndex}";

    public string DescriptionText => string.IsNullOrWhiteSpace(Description)
        ? "Brak opisu modułu"
        : Description!;

    public string ProgressText => TotalLessons == 0
        ? "Lekcje ukończone: —"
        : $"Lekcje ukończone: {CompletedLessons}/{TotalLessons}";

    public string QuizText => $"Quiz: {(IsUnlocked ? "Odblokowany ✅" : "Zablokowany 🔒")}";

    public bool ShowUnlockHint => !IsUnlocked && TotalLessons > 0;
    public bool ShowNoLessonsHint => TotalLessons == 0;

    public ICommand OpenLessonsCommand { get; set; } = default!;
    public ICommand OpenQuizCommand { get; set; } = default!;

    public Color QuizButtonBg => IsUnlocked
    ? Color.FromArgb("#FACC15")
    : Color.FromArgb("#2A2A2A");

    public Color QuizButtonTextColor => IsUnlocked
        ? Colors.Black
        : Color.FromArgb("#9CA3AF");
}
