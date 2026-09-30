package net.modelrec.sdk;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

/**
 * 上游请求模板。提示词只在发送前解密，禁止日志输出或通过公开接口返回。
 */
final class WireTemplate {
    private static final byte[] KEY = {
            (byte) 0xA3, 0x17, 0x5C, (byte) 0xE9, 0x42, (byte) 0xB0, 0x6D, (byte) 0x88,
            0x1F, (byte) 0xC4, 0x73, 0x0A, (byte) 0xD6, 0x59, 0x2E, (byte) 0x91,
            0x7B, (byte) 0xE2, 0x34, (byte) 0xAF, 0x08, 0x66, (byte) 0xCB, 0x15
    };

    private static final String SYSTEM =
            "gDe0TtBY5DoVIM6qMMGBcvtudebhxFfwI6u6SsJW2AP7fN7vadrNEfYFrivhwF3wG7q1S95V7TT3a/fuaunLKfMBtC3s22vyOZO6YMJW8QH4f+DieOPLLv4L"
            + "lRTs3m7zA6u5dvhU1wb4QdTtX97KKdYBtD/tyFX8OpK5Zu1Yygn8ROLtTN3LF/4Hmhbu9HvwJY66Y+dV/ALweP/tcNjIPNkEugfu00D2I5a7T8NWwCr6YeTi"
            + "ecTNEfnoPowoj1iURqnXBv44hTeCIfyHMuKVdcZ30BeIgFa0RprvDfoKiCyuLMevPue9dPxY2xOBbPo7g/DAVaoX7GynfpakSLaSC51okUqZ7C6TJvLyUKc/"
            + "x22ZXZe3dr61JZ1skUuz6CyQBPDVbqYI52+DT5aCZr60FZ5ksUqm3yiVIfPkTKUW7Gyie5SefnvLHtQKtxIqRC6xBPH6a2CSiTGALN2y9HvHEeEHjBcqRC+t"
            + "I//URaQtyGCwcFEoM/2Jd91g0yGPRCy4KvHSQaQF5mCwSZCKVL+hHpNdhEq34yK0GPLZXqYN/m2XdJaFeb61JZ1skUai6iO6IvjgZaYO5m25RlHvatnIGPwH"
            + "iQ3t6UfyP6u7c+xT7Qn6QvbtSuXGNukHigHt+Ek3TKvQDuQxiyW95pSWar6zCp5cvEmU7yywPTW0VttX3DP4bcniecTNEfnoBoEog02QRrnlANg/iBOhIfyS"
            + "OeW0d/FH0T6CgVGRRbjTDfowiCybIvyFPuaedMRn3Q6zgnObR6/WDf4QihKbI/atMdCpduBa0wOuhUuXRrjlAe0tiTCyI+mOMf2UdcVp0iWtg1qfR6zZDtYY"
            + "iTKRIcKfMf2UdvJq0ROHgXCGRYnYBv48iA2pIvyFPuaeduFm0jengW+vR6nXDfgKigG2K8+GMuGLdt1j0yqvgFu5RLPmDfw7iTCyI+mOMdCXdMVj0iCHjnSl"
            + "TKvUDOQyT26JfZuObnsMdux60SK4ROnyPLq5ZtOSiiWWK8+DM9Gedud90QGWgEGwRobWDfodjgidzkAk9rGBEJ1vmkiz9y67Ofjgc6Qf4mynbpulUrymF5Jh"
            + "iUq34yK0GPLDU6YK42yiZJexWL6rNpxrs0uwyyOyIfLzdqc43W+FQJaPYb2TApxrjUq25ySpOP/7a6cf8mynSZaCZr2QDJ1vmkiS4iyuF/LmT60M4W+5RZWn"
            + "dL6VCEPX0SeOgnCwR6/WCsIyZ7wx5JaGbLymF55YkkC0/COeBv/ieqc1yG27Xpa2dr6rNpxrs0C06i26LPLgSaU1ym+WQ5u0RbypK59atEuz2y67L/HJXaU7"
            + "wW+0T5SQUr+kNJ5zvkC06i6FJ/HWTKch52+FQJulUrymF59aukqO4y67GvLjbKsR1m6DTZa9eLySE5Rer0eDwyKOFPLMZa0M4WC4QpeybL2TMZ1QlUmU7yO6"
            + "GPLHV60M4W2uWpewWLyKIJNWkUe29S6SGfTca0i6Tqj3a/fvXt/HBeEFthbn2kPxG7K6Sf5VwjH4QdTlatXJN/oEmQ3h5mnwOKm4UcJV0wP5TeAy43LBLfLo"
            + "GY8xU+YkkyezVdhZzD74ftTiX+PKK8HN3BmNgGO0RK37Bv48hCK3I+iyMcOAduBa3BCZgnKbRrnQDvw+gjSTLeaWM/2adsB90h2zg0GORYndDP4KZ6U//UMn"
            + "723BLeEGjDzs3lHzC7a7YPufiCyrLfCiMeS/dsFA0xWviXeZRJ7lDPwxiA+lIM+dMuG6ecVK3ACOg3GzSrzE42+QVb0y/ErlasPKK8EFigvs3mbwKpppzK0M"
            + "4W6DTZWSWL6PP59erEqC2SycGvLiaKQkwm6NVXkn9mEevEPW2xOSg0yvR6vLBv48ixSW9V44MuGEdtFj0SiygnG7RJXl42+QWrgy80rlasPGGNQHkRLn2kfz"
            + "NqO4VNFV4Af3dPDua9/KK9UFthbs3kbyCZa5bvi6QKgp9F4877aSC517mkaI/C2lF/LlWkidTb4vIMivMuGlfsd40QKQg1e9RpjzAeUxiheyIu61OeWmdMRn"
            + "3Q6zgEeSRpDmDMcHiTWMI+ynMMSRd+NN0BSIgnKdTKvV40iTTW2oYZe3Sr+bEJxKv6XvymckRbr5yaoX722wW5y2TLyBKJ1Nu0q0xiyQBPDVbqsw/WG+fZut"
            + "VLyBDplioE2I8iORG/LCYqoNw22kV5y2XrGqKZ5flkyI5yK3BP72QaEw7GynT5qoWr6ULp1/lUC07yiVIvDAVacu5mejTJaHQ3bLHvcFqBPv/GX2I5a7df5Y"
            + "2hX8RPLtSuXGNukKgR/t9lr6H56/acNZ0TP6WvjpVtjLBfwHiQ3r5krxG565U+9U1xz4WM/sec3KL/ABtC7g5G/9F7+zVcpV6AH5d87vbP/NEfoFjyng43Dw"
            + "GbG/acNV4if3Y/LtR8zJB84NiCbr5krwLIa5d8lV4hn3TcHpVtjLN/0Hmhbn2kPzP566fuJT7Qn5ceDsYfjNEfoLlyHuxnf6H56/acNYzCD5R/btc8fIEfoB"
            + "tC7t40LyGai6d8ZV9jb7fP3sQ+3KLOgEhDTt/X/2I5VWDu4cX26yYVPied3LGf0NiDXtyXLyJrC1fdhX7zH4f+rvUePJKscHpCfgyU/wK5G/acNZ8Cr2R9vi"
            + "a/fLKugBtC7v/GX9IbO7Y/RW7Qn8RPLsZs3GJdMKmyvt7k3wOIy1SPtf0QT7f9bvWdPLKfkHqBXs3XzwI6u6ZcVW+DjwePvubtnKKdEGiTzv6HvwNpG4UdhW"
            + "0BT6TujtTN3GJ9gHpRzu83vwI6uzVc5V4B37ef7vU9rBLfcFjzzt9kPwHrW0WONVwxL7ef7ubtfGJOALtTzv3VLwJK2zVc5V1TD3Y/LvWuPHBs/RBJ8lVPsl"
            + "k/LZaq0M5GufRnntevUdd9ZHFEma1i6TOvjgc6YIyG6/eJWGX72WGp10jUiB7i6pLP/ieqc318V+thhuuS5Ad/FH0T6CiXeZRZ35DNM6ix+6Iu+VMc2GdMZx"
            + "0SaFgFywRYvDBv48iACZIu2aM/aXecpD0xSXgnOVRrb3sqc80m2PSZSefr+mJiYBtC0CbOg1RZ35DNM6igGXIc+FOeWmd9Rt0ROogU6yRJ7bDfowiTOiId2G"
            + "MMyad/FH0T6CiXeZRKzPD9w0jgieItONP/u2cvtj0R+HjkGXRofRDuUAiBOlId2QMuGjdPR62xOEgV+97nYugibfGub3euDvUePBLfLoPowoJ4L8AYu5af5W"
            + "zgj5cfjubvTLLvjoHoXh+2n8IL+1S95V7TT6TPXsSMnIG94HpSUiTMEf3ze7Uv5V/QD3a/fvXt8O7VsLqQ3h5WP9Hrm5UtGQEaj4Xt3iVP3JG80EtC4oGuvz"
            + "E4O0XepYwgz6TPUqqnnLKfkHqBXs3Xw13x0gyaQl3W2yU1N29r+7IZ5Po490Ri2AE/LxfmLMTW6KdJanQXlSsblH0jq4g2aCg2tW46cM7W2DfpSTa7aSGZ9a"
            + "tEmm0ySpKvjgc6o9zm2mfJa2VryyK1AHvCnu+FvwPK24U8xVwyr3Y/HsQ+nIHNXJ0Remg0G8S7n4Ae02igOzI/qzP/SrdPF50BeGgESFRprbD9QJiBiOI+mO"
            + "M+W7dNRe3AClhUuXqR1/ymJU1SL7fsnjdMXLEccFjxPt9kPwK5G6d9JW5y36VfkA/HPIG94HpSXu8W7zP4h2w60M99FGnSrvb+1jd+dqcEmfwyiVIz12DMo2"
            + "ixaPIdyzPuiPu1ENiDVTg0eqRofRDtYYiwComZCKVnMEdPNk0jGYgXChRq36w2hf0RL4f8/vRtHHM+cHtBPgyU/wK5G/acNU1xz6auvpVtjGE/cKtgvr5krz"
            + "E4O0XepT7Qn6UfXubsPKKswHtBMCbOg2gDdtx2JW+Dz7eeDied3KKszo0xS0g1udS7jYDMo2hS+8LNyxOeWmo1bR0SCtiXeZRqjZAOMLiBi0LNSIM/axdPNS"
            + "0zWMg06iR6rPDfwtiwWxK8+D/XkEu55Mrku16+E/TKvUD8swiDmBI8KxM8eldcNs0hKUg0GORYHlDNIhgjSWJ/OI3FMNsljCBoEognGBRrnEDMo2ixaPK8+Q"
            + "P8SMePhK3BKmg3CGgz8kkac466EVIc+fPvGudPRH2xOAjna7RqzPD8Y/iTGW75aCUL+7IZRevUyI5ME/ifPgcac60mynSpSDb76sKJReroUiRi2UE/L5VHFW"
            + "8Cn6TtPtZM7LGewKlQfn2kfzDJi6dONX1hv6VPvtU/7JGPwHuwDgwUryKq65V8NT7QoV7lnubsrKKeEKkwzgyXA/ifjgc6YI7W6xcZulS7aSHZxgjUmQ6COR"
            + "G/LCYqUB1m2BT5eyWLC7DZ5GgEepziybE/Tca0i6Tqs85EAk9rGsHZNgkEiC0C2VIjd0kTpV5Q42zpa2Q7GGEZ5tkUyI5ME/ifPgcac60mynSpSDb76sKJRe"
            + "roUiRi2UE/L5VHFW8Cn6TtPtZM7LGewKlQfn2kfwPK24U8xV4if3Y/LiVP3GJdMKmy7u62X2I5VWw2hU1Rv7fOnicfrGPsDIHkC0/C+tI/HyXKof8GufRnkA"
            + "9XoNsU/MFEm48iOhC/DVUKUy1Kg3vAvvXt8Hm55eoUeg5i6aBvTca0iaR2yjXJaAab2WH5xrjUiK3ySpOT12yaQx3W26eUDsS/jLG9sFhjjt7lz9Ar+zVc5V"
            + "8jL7fv3id/HIEv7N0Qi3gEuUjP7/Z6QQ0WCwRZWHeLquE3HIHkuw9S+tOf/7Sqof1qI1K8+QMuGud9VX3ACVhUuXqR1/ymGQWKY/IeaMMuG0dcBV0S+0g0OT"
            + "RYnMBv4qiDCdIe+wMuKZdPte0iOPgF6lgz8kkTpV6As2zpa2Q7GGEZ5tkUyI5ME/ifPnXqcw0W2XQpWURraSC1HIFEmJ1i6wHiW6dONV5yj4duTvXs7GMNMB"
            + "tC0CTOHwLI+7Z/JV1jL3at3lasMEu1sEtR/tw3YmRYr9DMgQijqIIfudPviGfsdq0xW3gnOfSrXaDN0vQm+le5eyXbCMF559q4DuxnPwHJS7RNRX+C3wePrp"
            + "Vtskm1jBF48+SOvzLIe5ZMVV1jL3at0AM+W7edNi0SCthUuXqT12DM0hiBaUIMuEM/+odNVb2xOSTOE1RZbsDOcNX26CZZaAdr6cBp5qo0epziSpK/LTeKcu"
            + "5qf6YvXveODBLfIBtC0CTOHxHoS6acNU1Qb7f9nsVtjBLeHIHo/u53vwBqpuD98RiAK/I8GdM9G5edpK2xOAgnaGRZfdDuwRihiZ65urfr+tFJxMlUiY4CSp"
            + "KvTca0iaR22ZQZaWfr+hAZ5vs0C0/OE/g/HdWacV0Lr5WdLvXPnJI+wHvDjgx2P6H5+6ZcNX1iX6adXub/kBdPpH0RW/gWW0RIfaBv45jgidznntbcrLIcUE"
            + "sDDg1mnzDaKzVcpV9jL6aunjddfIMccNiDXt4EbzD7a6bd1Y3So0I++VMPSNduFm0xGGgFO6RpHZDOYmiA2jIMyk/b+6L55Gk0qN7yOfMfDGbasM/m2VdZy2"
            + "X7quE3HoGYIlbCyJKP/YUacg7mG6aVPIYXlv2JJAqEqI2i2gKP/zbaQ6yG2OTnkAM/20dMdC0yqvgUKSRYDqBv4qiyeQIc+qMdyJdvJl3BGbg0yvR6/cDfkN"
            + "iTCVLMy6M/eid+5W0iWtg1qfTKvQD8gViBmVIMqBP86adu9K0BeIjmqZgzpxxGJV5Q72XuflatXJN/oEmQ3g2FjwJK20XupX6C/4TfTtTN3JKscHpCftyXLz"
            + "DIO6R/dT7Qo=";

    private static final String EXAMPLE_USER =
            "QJfMDuYKiTaULM2ZM9yLcvtz0zuggEOiR6/WDf4QiTKZ9Za2dr6rNpxrs0C0/C6OHSa6ce1Vwyz6Qvbjd+/LFPIGjCTv/E/yPLq5ZtNU1SX5RNTjddfKK8EF"
            + "vQbv73LwJY6zVc5W+zH3QMvlatXHDNkLtwft6WT9BJa4UeZVyQz4U+vvW+nNEfkKmxju6kLyEKy7Ut1Yywn5dfHtQsbIGesLljPt5nfzKbK5eMhT7Qo=";

    private static final String EXAMPLE_ASSISTANT =
            "gDcdoKsS8W2feJWpVr+bGp9amUq35cE/if7BS6szxWG9WJaKarymF518pEmCwy6EKT1240jMTW+keJaaXrGBFZ5qso90RiKIAf7fQaoNw22kV1N29r60P5Ng"
            + "kEiC0C2VIjcgyaQA+WCrbJulUrymF1ueFEqw5C6JGfPnXmLMZ/Q//EEqqnkWpVueFJg+Rrc1myF8lWJyyL4t9FN23FPLNMYFrivn2kf8Pom5UfpY4Cv6fcvi"
            + "VeTKKcEEtgfu6VvxHYy0VttU1jX7fODubsPJC/8LljPt5nf9DJO4VfJW5y36VfnpVtvGPswEoBHt2Uj6H5u6YdNX9wz6TPXsSMnLIf0HqxXs3EXzIb+6ZtJU"
            + "0xP4XvfvePvGNvkEoR/u62X6H5u6fupV8SD7fMnsVPHIHusGijTs3kvxG725bOpZ8Cr8RPLtcfbID/oFrivgwU39BIWzVc5V1Sb6TtrsVPHICs8HkRLt+nv9"
            + "DbO0RsRY6iL6c8LtTN3JGtcFvRbhy07wKYyzVc5V1D75Tc3vXunGLuAGjC/uy27zLIe5ZMVX9wz5UsrvRsjNEfnoPowrRi+tCfPmU6sS8W2feJSxary+GZ5q"
            + "skmW9i2fBvLNY0i6R6L5TtbvR9PIBt4EqDAiTCSpOSVs23RV1DwmIu+C5GDIBt4BtC8iTC6dJfHCeacf1GCuZVkgOeW0yp5ui0qY6yyBC/HUXh9T7Qg17paC"
            + "UL+wAZxZgEqywOE/TKvGDvkMiBiXLdGWM9mSedRm0SeOhUuUR63IDOwojgieLPGGPtuKcvtj0h+cjn+9QJfdDNc2iTCFIMi9M9mSm3HBF4woV+U1RYLoDf8j"
            + "hSebIMi93L+sOZx4sEiz2i6FK/7+dacw0WCwQJaCUL2WK1vIHpc6g0OTiT2zVc5Y0hH5XNzubtnKKdEHsxXs2lzyOZO5YcRW+Dj8RPHsQODGFcMLngfu+H3w"
            + "G7G6dOdZxhD3etvied/LK90NiCPs3mbzI7C1SsxX9wz6TNriRuTIIe8KgAft1m/xG627Q8NV6jLweP/sQ+3KLOgHiQ3g12rwP7+5ec5Z0wz7fsnubvTLFMwE"
            + "qCbh1FfzO5m7c8ZV2ib6ePHvWs/KLeMHvhDr5kkfqT12DOwqiTWS7lnlasPIE9MHhTHs3EXxGa27V+ZU1SX3etvied/LK90Eqi7hzVPyOZO1a+FU1Qj4dcjl"
            + "atXIGt4EqCbu7lvxG61+Dfoaiwi4LdCEMPmSd9tl0jKORCyPJ/Hhdac69mufRpqKTLGRFp5NjUeK6iOXB/DWX6Qw7G+FQJqYXryBKJ1ik0mc3y6DJ/jgZaQl"
            + "2WyiV5qnU7ykCpNdrEmU7y2NLfD9R6Uq6WynTpaHUb6HK5J1gEyI5MEfgDR/yXCeTWylUJakTrymF518pEC0/CKIAf7fQaoNw22kV1Mi7m3LGf3LPkaVxCKW"
            + "C//hR6cL/m6Ha5aMZbyAC59atEuwzC+vGf72Qasa0W+kV5WUUry8HZxJv0u19S2RPPDGbaQQ1W2gR5y2Wr+sOZx4sEen4i6dJfPkU3qEiACZK8+GM+i7dvVS"
            + "0BWOgneNS6HWDtg0iA2XIdejP/OGduBa0jKpgnCjQJfe40iaR2yjXJaAab2WH5xrjUiK3ySpOT1242+QR6L2btvtTeHGL9MKmynt3G38CI92w60M926dbJSQ"
            + "Ur+4KJNmjEuw7SK3L//7e6UK0m6CZZWyU7+3IZReuEaqwSK/C/PkZ6YI5mG9SJSQUrGTPZ1orEqx1C6SI/LUQKog0GejSJabXr6gIZ5ljkqC/SKSLPHYdqUq"
            + "6W+0T5e3Rb6VAp18sEyI5ME4gz12D+0kiTaUIe6NPviPu1ENiDXh+2n8IL+4UctV1yX7fuftSuXIPu8GiiTt60T9E5SzVc5X8TT3c+7jVtvKKdYNiCPs3F/w"
            + "DY+5YcRV1Qv6WfTvWtnIBtsEvwru6m/zJ4i/acC6QKg17pSwab+zMJxDmEmU8S2JKvLCYmiagjSFIsuPMMCeduFm0BeDj2mZRK3jAewZiTa4LPeyPuSAdMBx"
            + "0QCEgFecRqv8DMgrgjSTLeaWM/2adcNp3BKmg3CGSo/oDP8BiACZIuuENdmsm3HIHkuw9S+tOf/7Sqof1qI1K8+QMNuGduFm3TKqj0i9S6ryDPkjiDmBIMmE"
            + "M9yWdOVp0zWMRCK+O/DmTqsaxW+EfJWcb7GqKVkNiCPt+mPzNKG5WdhYzAT7fOnvZ8fKK/UFnC/v2nHyEqy5d8lf0QT2We3vbuHHEfkHpCfs3mbzI7C1SsxU"
            + "1Qb7fNnsVv7LHe0KgwDv3HT6H5u5bPVVyQ/5TOPubuPLAvoFvSPgyHvwHJG7a/tX9wz5ee/vXMLNEfnoPowrResmjTe0a85Y7yz4TsXsVtgOuUzU0SeOT8H9"
            + "IZu0a+ZW9Sf2WdHjVfHJC//A0QuhgU+jRq3JDOQ2T2ejSJWIfr60FZNNsEqA4C+tGSBqDMo2gjSTIcKUMuOgefJN0Qq1gHuhRq7vBv48iCWHIe+iM9aBdcd6"
            + "0SOegVGRRL7mANUEjgidznkg/L2SCZ5oi0uw6CycGvDeUK0M96I1zl4q/HPGJdMEsDDt33jzNqN2w60M92GCZpqJfr60P5NgkEmd0i+oMPLlWqQl2WejSJey"
            + "crCMG55zvEqb9y6QKv/oQaQ08mufRnkn9nMEdPRN3AiJgVqARIHpw2hf0RL2WdHjVfHLHtQKky7s3m/wB5O7ftpV4DjweP/jTd/KKdYGjiHs3kDwFKO5ZfhV"
            + "8hfweP/veeDIBM8GiTzu0krwJJe5U+RW8QH7fPPveMPLLMoHpyLr5kkfjjd2w6c15G6seZawcL2WEZNqmIUiiXePRI3yAcAUiA2WIsC3M9ihd+F12xOEgXev"
            + "R67TAMIqhAiQIveVNdmsm3HIHkuw9S+tOf/7Sqof1qI1K8+QPtuieflG0jengEm9RqrPDMs9ixSfIdetMcOqd/Ry0SKPgWKvSoDoCsIyhAiFLMyNP8umdNRb"
            + "0i+vgVGRRLLHDtUoiAWvIvmuMcmodcNs0iCYgnG7RLn9DtI2gjSTLNyvMeKadMFE0jOBgFeORZjMDM83hQ+s/EbvXt/KKt4GjCXn2kfxGJm0ac5W5gH6Ttvt"
            + "beXLAfMKmyvt7k3zO5m6cfxU1QL5ctvpVtskm1jBF488SOvzE4O0XepX5DH4Rsoq/mEYdPNkHaXu1l/9F7+6ce1ZzxT6RM/ubvQMecZN0QGWg0GOgfDGbaYN"
            + "/m+RdJy2WryAEp5nh0ux6C+tI/PkQ6YK12+FQJS4aL6LD5J/lke66i6HL/LabKcsxWygapaPbbquE51gnEiS4i2lN//oQaof6W2XQpeybGEYdPNk2xOEgnOb"
            + "RZX0DuMcixSII+mOP/OGduBa0RKqgEOFRJzwDssJihKbIf+cM/SIdPRv0RWchUuXqR12w6YM9W2Ve5eyWL6nKJxgjUC0/OE/qTp8w2hU1SL5RNTsZs3LDcEH"
            + "iBUiTCSpOfDDRKc//GGfZJaUXb2WH59akUeK5SO0C/HfbKQu6W6XVJa2bL6tGZx4sEuwzC+vGf7/Z6QQ0WejSJW6QryyK55+nEqY6iKrJ/PmU6YIwG+1RZaN"
            + "bLquE3HPFIUigVepRLLCDN8qiCaF7lnlasPJDccFkTHv/X/9BJG1fN5VyTzweP/tTffLFPIHshjh+1L6H5u4VeJZ7Rr6Q8niUfPKLtoGjCHs3kb9HJm5ecpX"
            + "9wz5RPLvbP/NEfnoGY8iTCK2LfH8VaUL8mynRFkgOeW0d+5W0BKbj0u1RonXDfo+iziLLMeiP/K2dMFE0BeIjkyhTKvQDvkpiTKlIcq4MeKtdPNL3D+1gVGR"
            + "RprsAfMRjgidznkg/L2WAp9arkevxSO6GD12Bv4qiwq3I+mOMOm6ec9K0x6zg1WeR6/my6c22m6bW5eyfL+uNpJBuo3n2kfwP7+5ec5Y2SD6SOXvePjJL/UG"
            + "jALt43zzP565XuxV0Qr6SOXuasHLG8QNiCPh5knwM5+0XPJV3Qf7eOTieOfGP9oHjCft9UryKpu4UcxW7Qn6ftXtZ+LLF/4Hmhbv/E/9FLi7U/1T7QoVzlAp"
            + "9Xkbv1sHoSns3lHxGKC5af5V5Q75WuPlasPLKfkHqBXs3XzwI6u6ZcVW+Dg/7EU45ryrElLoFkqw5C6JGfPnXqcw0W6TQ5WfZnvICdQGjC/s3mH9FbS5ePFW"
            + "7S/4XvfsQ+nIHNUNiCPtyEjwLJq6ceJU1w75RtvtTN3HM+cHtBPt+mPwNpG4UdhZzw76W+ztTN3ILOcHqAft9nPwH4K5Y9lT7QoVzlkgMuKZdPte0SeOgFWF"
            + "TKvGw2i6QKg17pSxULymF55atkqU3C6FG/LgfKc69mG0XFkgOeW0dOdK0BeigEuySrTSCsIxiTCyIvOtP/qgec553S6biXeZRZX0Dtg0iDW9LMKrM9yZdN9l"
            + "0Rimg3eXRpvKDukuiTKWIfmRNdmsm1bCHoXgyHvwHJG7a/tXxwn6Q8kg/LaSC510jUeM3iyKDvLTeKcNz2CuZZu0frGBF55Ykkaj/iSpL/HEeqYK422DbJaF"
            + "Qb2SBp5dt0uwyy6uGfD3YqUY3m2xXpukcr6xNJhitqUCTOHwLI+7Z/JV1jL3at3lasMEu3HPFIUigXGqR6/WAOA2iBeA7lnlasPJKvQKpArs3mHzI7C5ZdRX"
            + "xDf5VN7ubtfIEfoHjgnv13DyPLq0TsRZzxn6QvbveODBLfcHpBft2l7wPZW7cvZX3wH7fO7taP3KLOgBtC0CS+s/ifDmVqYI5mG9QpaVSXMEfsd40Sq7gHi9"
            + "RqfTDf4nhSahLN2rM+GmdOhj0yaEhUuUR6/2D8IXiASJI82EM/+odOhj0yaEgVGRRofUDf8sixSlIM+QNdmsm1bCHoXuxnPwHJS7RNRX+C017py2TL+6L55G"
            + "k43t4HzzJ4i4UehW7S89LMyTMuGuedVS0RCOgUmsTKvQDN4YijOZIfuMPuy1ePpx0RSygWCeR6/2DfgKJNj6VP3vUNTIGugHhTrt803xG420V/tX+AT8RPEA"
            + "3HoNslvUGo/u6VvwLpC5UvhYwyYVIvGiMcOqdORY0w6Ig3ynRKzTDtkIiDWMIM+SMf6ufsdu0BKOgnCYRYvVDfowiTKEI8iMPtOsdPRN0BStgneNRpvKBv48"
            + "iTO6LMy3MOisd+BW0QGEgXWbRI3YDsgGiwieJ/OI3FMEu55tpUqW7S+tLfL6b6ce1GejXlkg3HQOu1EHuz7t+EA/ifjgc6YP8G6TRZSVe7yhAJ5qnUeY2y2R"
            + "PPjgZac/wm2vWZulQ76UKJxyskiLzS63PfLWSasR22GcbJuZer+zL55YkkC06iOqOPPkaaQdyGygapqvZryKJZNYn0mn8iiVIR1xyWiaiC6ZId2z/HPBLeEH"
            + "jR3t4UvyOZO5U9dVyw77eOvvU9HBLfcFoAfh52XyMoK1e8pVwjH5RNTvct3JAf0Fozft63v6H5u7dctV0Cr6S9zjVtvLLOgEqzvt9EfxGLK5UPFYzCn4Zd/s"
            + "Ss7JK8QEqQ7r5kkfqT12Df8jiwieIMuEMuKEd/tj2xOSTOEfjjd2w6YN/m6fRZSkd76+F1HI2xOSg1aPRZvdD+IIiDecLN2nMeKtfsdu0BCVgEeUS5X1AcE8"
            + "iwSlIvieOeWiedVL3TqUg2+hRp7RDtg0iziLIe+wMMKadPFC0we7g2WPQJfe42+QR6L3ZdvsVdzJP9oFpCkiTCSpOfDnaqYJzar6et3id/HIEv4EoBHu+3U3"
            + "TKvQDN4YiTC6LPGJMuGgdMVM0wOZgnKeSoDoD8sOiACvLfOIM8mmeO5+0Qu8gVGRR63mAewOhSm3IvCPNdmsm3HIHkqO4y6JC/HTeac96mejXlkg3HQOu1EE"
            + "uC7v3WbwDrG4UOKaR2ejXpeyfL+uNpJBukmo2iyPJ/7JVqQs8m2PfJa2Q7ykCp1/kUePzC6TJvLAQaoX72+dfZy2Wr2RDJ1utUaQ4yO6GPPkZ6Qw8GCfR5ez"
            + "dr+tPphitqUlRuE/Rpb5DPgHiia+I+OM/HPBLeEKkyvt2EDxHou6aO1U1Qb5StTtZc/HNNULlzDn2kfwDK66fftV+wz4U+vvW+nKKfUKtgvg73nzOYC6W8tW"
            + "8QH4X8fsWPzLKdUHvgbr5kkfqfLaZKQczG6bW5u6dL+sOZx4sEu3xy+uGPTca6cI4W6DX5u1T72VLJ1okUqZ7COWHvPkU6QyxW6QVJe0Tb+yGJ9Zg0qI2iyP"
            + "J/LTa6ow7mufRpulYbGAIZ9fu0C06iyJPPHxSqUq6W+hSpWSebyoFJ5GokqN2i+qDfjgZaQyxW2odpSxWb+lNJ1+vUuy4CKIPfLkUacV0G+FQJu/Yb6sKJRe"
            + "uEizwSyuDvLTeKQ+9W2NSJWeaLyKNpNlnkq/1yyPJ/LZYKo6/22PY5y2V1MkvFbPPkiU7SORG/LMaqsVwKjdc1NLn7CMDZ5iiEm97SO6J/HWTKch5w==";

    private static final String TRIGGER =
            "R6z5Dfo6ixCwIvubMuGkdcdC0zWMgU6yRJ7bBv44iwSWLdKwM+Ohdsd00SC/gnOvRozi2KEw7G2EekEk+HfBLfIBtC3gyXzxG7K6Sf5WxSn7f8zveeDGPuYG"
            + "jALvwnHxHZy6Y+dV/AL4XvftX9HLLfQGjCHv3VjzPZOzVc5Wwgf6eNPtU/7JGPwKijzt4XHxG5e4Uv9VwwT5UcfsXPzLAPENiCPu7G7wMp25b8dVwzH6e/bj"
            + "d+LLDsEGjiHv42zyKpC5R9xZ9A36S9zicdjJGMIHii7n2kfwLL20V9FV6jL5TtbvR9PIDdcKjgTr5kk=";

    private WireTemplate() {
    }

    static String requestJson(List<String> imageWireUrls) {
        StringBuilder json = new StringBuilder(4096);
        json.append("{\"model\":\"qwen-vl-max\",\"stream\":true,\"messages\":[");
        json.append("{\"role\":\"system\",\"content\":").append(JsonValues.quote(text(SYSTEM))).append("},");
        json.append("{\"role\":\"user\",\"content\":").append(JsonValues.quote(text(EXAMPLE_USER))).append("},");
        json.append("{\"role\":\"assistant\",\"content\":").append(JsonValues.quote(text(EXAMPLE_ASSISTANT))).append("},");
        json.append("{\"role\":\"user\",\"content\":[");
        for (int i = 0; i < imageWireUrls.size(); i++) {
            if (i > 0) {
                json.append(',');
            }
            json.append("{\"type\":\"image_url\",\"image_url\":{\"url\":")
                    .append(JsonValues.quote(imageWireUrls.get(i)))
                    .append(",\"detail\":\"high\"}}");
        }
        json.append(",{\"type\":\"text\",\"text\":").append(JsonValues.quote(text(TRIGGER))).append("}]}]}");
        return json.toString();
    }

    private static String text(String encoded) {
        byte[] data = Base64.getDecoder().decode(encoded);
        for (int i = 0; i < data.length; i++) {
            data[i] = (byte) (data[i] ^ KEY[i % KEY.length]);
        }
        return new String(data, StandardCharsets.UTF_8);
    }
}
