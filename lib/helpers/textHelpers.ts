export const adjustWhitespace = (text: string) => {
    return text.trimStart().replace(/\s{2,}$/g, ' ')
}
