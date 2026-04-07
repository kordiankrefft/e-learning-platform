namespace Data.Dtos.Common
{
    public class PagedSlice<T>
    {
        public List<T> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public bool HasNext { get; set; }
        public int TotalCount { get; set; }
    }
}
