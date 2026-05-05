export const XSD_DATETIME = "http://www.w3.org/2001/XMLSchema#dateTime";
export const XSD_DATE = "http://www.w3.org/2001/XMLSchema#date";
export const XSD_TIME = "http://www.w3.org/2001/XMLSchema#time";

export const BULK_IDENTIFIER = "bulk";
export const DATE_KEY = "date";
export const EVENT_KEY = "event";
export const FLAG_KEY = "flag";
export const FLAG_EMOJI = "🚩";

// The default text length characters to display before truncation if column width is not provided
export const DEFAULT_MAX_LENGTH_CHARACTERS = 25;
// The approximate width of a character in pixels, used to estimate how many characters can fit in a given column width
export const APPROX_CHAR_WIDTH_PX = 8;

// The expansion factor is a tunable parameter that determines how many characters to show based on the column width.
// Change this factor based on how aggressive the truncation should be (e.g. 1.5 would be more aggressive, 3 would be less)
// The higher the factor, the more characters will be shown before truncation
export const EXPANSION_FACTOR = 6;
