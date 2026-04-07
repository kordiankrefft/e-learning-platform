using System.ComponentModel;

namespace Elearning.Mobile.ViewModels.Quizzes;

public class QuizOptionViewModel : INotifyPropertyChanged
{
    public event PropertyChangedEventHandler? PropertyChanged;

    public int Id { get; }
    public string AnswerText { get; }

    public bool IsSelected { get; set; }

    public string RadioGlyph => IsSelected ? "◉" : "○";
    public Color RadioColor => IsSelected ? Color.FromArgb("#FACC15") : Color.FromArgb("#9CA3AF");

    public Color Bg => IsSelected ? Color.FromArgb("#1F2937") : Color.FromArgb("#0F0F0F");
    public Color Stroke => IsSelected ? Color.FromArgb("#FACC15") : Color.FromArgb("#222");

    public QuizOptionViewModel(int id, string? text)
    {
        Id = id;
        AnswerText = string.IsNullOrWhiteSpace(text) ? "—" : text;
    }

    public void RaiseVisuals()
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(RadioGlyph)));
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(RadioColor)));
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Bg)));
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Stroke)));
    }
}