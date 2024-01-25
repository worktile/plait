export function idCreator(length = 5) {
    // remove numeral
    const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz'; /**** Easily confusing characters are removed by default oOLl,9gq,Vv,Uu,I1****/
    const maxPosition = $chars.length;
    let key = '';
    for (let i = 0; i < length; i++) {
        key += $chars.charAt(Math.floor(Math.random() * maxPosition));
    }
    return key;
}
