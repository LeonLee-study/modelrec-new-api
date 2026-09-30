package net.modelrec.sdk;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class JsonValues {
    private JsonValues() {
    }

    static String quote(String value) {
        StringBuilder out = new StringBuilder(value.length() + 2);
        out.append('"');
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"':
                    out.append("\\\"");
                    break;
                case '\\':
                    out.append("\\\\");
                    break;
                case '\b':
                    out.append("\\b");
                    break;
                case '\f':
                    out.append("\\f");
                    break;
                case '\n':
                    out.append("\\n");
                    break;
                case '\r':
                    out.append("\\r");
                    break;
                case '\t':
                    out.append("\\t");
                    break;
                default:
                    if (c < 0x20) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else {
                        out.append(c);
                    }
                    break;
            }
        }
        out.append('"');
        return out.toString();
    }

    static Object parse(String json) {
        Parser parser = new Parser(json);
        Object value = parser.parseValue();
        parser.skip();
        if (parser.pos != parser.text.length()) {
            throw new IllegalArgumentException("trailing json");
        }
        return value;
    }

    static Map<String, Object> asMap(Object value) {
        if (!(value instanceof Map)) {
            return null;
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> map = (Map<String, Object>) value;
        return map;
    }

    static List<Object> asList(Object value) {
        if (!(value instanceof List)) {
            return null;
        }
        @SuppressWarnings("unchecked")
        List<Object> list = (List<Object>) value;
        return list;
    }

    static String asText(Object value) {
        return value instanceof String ? (String) value : null;
    }

    private static final class Parser {
        private final String text;
        private int pos;

        private Parser(String text) {
            this.text = text;
        }

        private Object parseValue() {
            skip();
            if (pos >= text.length()) {
                throw new IllegalArgumentException("unexpected end");
            }
            char c = text.charAt(pos);
            if (c == '{') {
                return parseObject();
            }
            if (c == '[') {
                return parseArray();
            }
            if (c == '"') {
                return parseString();
            }
            if (c == 't' || c == 'f') {
                return parseBoolean();
            }
            if (c == 'n') {
                return parseNull();
            }
            return parseNumber();
        }

        private Map<String, Object> parseObject() {
            expect('{');
            Map<String, Object> map = new LinkedHashMap<String, Object>();
            skip();
            if (consume('}')) {
                return map;
            }
            while (true) {
                skip();
                String key = parseString();
                skip();
                expect(':');
                map.put(key, parseValue());
                skip();
                if (consume('}')) {
                    return map;
                }
                expect(',');
            }
        }

        private List<Object> parseArray() {
            expect('[');
            List<Object> list = new ArrayList<Object>();
            skip();
            if (consume(']')) {
                return list;
            }
            while (true) {
                list.add(parseValue());
                skip();
                if (consume(']')) {
                    return list;
                }
                expect(',');
            }
        }

        private String parseString() {
            expect('"');
            StringBuilder out = new StringBuilder();
            while (pos < text.length()) {
                char c = text.charAt(pos++);
                if (c == '"') {
                    return out.toString();
                }
                if (c != '\\') {
                    out.append(c);
                    continue;
                }
                if (pos >= text.length()) {
                    throw new IllegalArgumentException("bad escape");
                }
                char escaped = text.charAt(pos++);
                switch (escaped) {
                    case '"':
                    case '\\':
                    case '/':
                        out.append(escaped);
                        break;
                    case 'b':
                        out.append('\b');
                        break;
                    case 'f':
                        out.append('\f');
                        break;
                    case 'n':
                        out.append('\n');
                        break;
                    case 'r':
                        out.append('\r');
                        break;
                    case 't':
                        out.append('\t');
                        break;
                    case 'u':
                        if (pos + 4 > text.length()) {
                            throw new IllegalArgumentException("bad unicode");
                        }
                        int codePoint = Integer.parseInt(text.substring(pos, pos + 4), 16);
                        pos += 4;
                        out.append((char) codePoint);
                        break;
                    default:
                        throw new IllegalArgumentException("bad escape");
                }
            }
            throw new IllegalArgumentException("unterminated string");
        }

        private Boolean parseBoolean() {
            if (text.startsWith("true", pos)) {
                pos += 4;
                return Boolean.TRUE;
            }
            if (text.startsWith("false", pos)) {
                pos += 5;
                return Boolean.FALSE;
            }
            throw new IllegalArgumentException("bad boolean");
        }

        private Object parseNull() {
            if (!text.startsWith("null", pos)) {
                throw new IllegalArgumentException("bad null");
            }
            pos += 4;
            return null;
        }

        private Number parseNumber() {
            int start = pos;
            if (pos < text.length() && text.charAt(pos) == '-') {
                pos++;
            }
            while (pos < text.length() && isNumberChar(text.charAt(pos))) {
                pos++;
            }
            if (start == pos || (text.charAt(start) == '-' && start + 1 == pos)) {
                throw new IllegalArgumentException("bad number");
            }
            String raw = text.substring(start, pos);
            try {
                if (raw.indexOf('.') >= 0 || raw.indexOf('e') >= 0 || raw.indexOf('E') >= 0) {
                    return Double.valueOf(raw);
                }
                return Long.valueOf(raw);
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("bad number");
            }
        }

        private static boolean isNumberChar(char c) {
            return (c >= '0' && c <= '9') || c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-';
        }

        private void skip() {
            while (pos < text.length()) {
                char c = text.charAt(pos);
                if (c != ' ' && c != '\n' && c != '\r' && c != '\t') {
                    return;
                }
                pos++;
            }
        }

        private void expect(char c) {
            if (!consume(c)) {
                throw new IllegalArgumentException("expected " + c);
            }
        }

        private boolean consume(char c) {
            if (pos < text.length() && text.charAt(pos) == c) {
                pos++;
                return true;
            }
            return false;
        }
    }
}
