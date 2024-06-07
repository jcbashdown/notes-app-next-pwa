//Originally intended for use with playwright but less sure about approach now
//Would have to run something in browser to switch to the test behaviour and stop using NODE_ENV
//As this is the env the bundle is built in - not the env playwright runs in
//But then running this and switching to deterministic ulids would also be something you could do in prod
//Which is fine - you can't trust the client so it's their problem is someone does this
//But it does give me pause

import { ulid as realUlid } from 'ulid'

let ulidIndex = 0

let deterministicUlids = [
    '01HZQD2PHKGT0XDPR1XGZNGGMC',
    '01HZQD2PK1EDMYYCY7NGMYF3EW',
    '01HZQD2PNYRHV1W9WXG2CCJE0A',
    '01HZQD2PSHA1Z9B2WMBK3H2FFD',
    '01HZQD2PXZQ54CEA9A8A34B94R',
    '01HZQD2RDFBAS6RG899T1F8G7T',
    '01HZRYVZ6T4WY1XQ8164RDXD06',
    '01HZRYVZ7WVWY34JX3XPRW9B09',
    '01HZRYVZA4Q0VR6DM1BRPHKQ0C',
    '01HZRYVZC8RYRBAXH0809WYYAM',
    '01HZRYVZEDCY4MBQ6NV8B2W78M',
    '01HZRYW0E1F5N1D0M9SE5ZAX92',
    '01HZSAHMMKHXNGJ4SS015ETACP',
    '01HZSAHMNMCS9SSH9WCRJ4TZ00',
    '01HZSAHMR0W52B5KSFR0JCEZ8M',
    '01HZSAHMTAZAEDP2H7X3SAYT4H',
    '01HZSAHMW9C1XBWQK8ANDVJRGC',
    '01HZSAHNWC8BMSPZDENPPZG5AN',
    '01HZSAFC9ZVGMJVQ4GHBBAAEB6',
    '01HZSAFCBHAYJHSS220X86YRD2',
    '01HZSAFCFHFNXSTB8D4BKKEG5Q',
    '01HZSAFCJV42GZZNQFPADQK36V',
    '01HZSAFCNDKFQMDTJCAMDDMS8S',
    '01HZSAFESDDYC3RH1VVG3PAA35',
    '01HZQD2SMCXCVT6FJNH18QPTZZ',
    '01HZQD2SP0JXP893BPGSP74CDE',
    '01HZQD2STJBSR81PQTAAFKGDVC',
    '01HZQD2SYTGQ337KWQGSVZZB5B',
    '01HZQD2T2NG5P8HBNE2T1J7K2T',
    '01HZQD2VQ2J66TP4R02G2A7JCN',
]

export const ulid = () => {
    if (process.env.NODE_ENV === 'test') {
        const ulid = deterministicUlids[ulidIndex]
        ulidIndex++
        return ulid
    } else {
        return realUlid()
    }
}
