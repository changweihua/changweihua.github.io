---
lastUpdated: true
commentabled: true
recommended: true
title: Base64、Blob、File 三种类型的相互转换
description: Base64、Blob、File 三种类型的相互转换
date: 2024-08-02 10:18:00
pageClass: blog-page-class
---

# Base64、Blob、File 的API #

#简介 ##

### Base64 ###

**Base64**是一组相似的二进制到文本（binary-to-text）的编码规则，使得二进制数据在解释成 radix-64 的表现形式后能够用 ASCII 字符串的格式表示出来。Base64 这个词出自一种 MIME 数据传输编码。

### Blob ###

**Blob**对象表示一个不可变、原始数据的类文件对象。Blob 表示的不一定是JavaScript原生格式的数据。File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。

### File ###

**File**接口提供有关文件的信息，并允许网页中的 JavaScript 访问其内容。

通常情况下， File 对象是来自用户在一个 元素上选择文件后返回的 FileList 对象,也可以是来自由拖放操作生成的 DataTransfer 对象，或者来自 HTMLCanvasElement 上的 mozGetAsFile() API。在Gecko中，特权代码可以创建代表任何本地文件的File对象，而无需用户交互（有关详细信息，请参阅注意事项。

File 对象是特殊类型的 Blob，且可以用在任意的 Blob 类型的 context 中。比如说， FileReader, URL.createObjectURL(), createImageBitmap(), 及 XMLHttpRequest.send() 都能处理 Blob 和 File。

## Base64、Blob、File 类型的相互转换 ##

### File 转 Base64 ###

主要应用场景：图片预览

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File 转 Blob</title>
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
    <input type="file" name="file" id="file"></br>
    <button id="fileToBlob">File 转 Blob</button><br>
    <script>

        // 文件类型转Blob
        const fileToBlob = (file, callback) => {
            const type = file.type;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const blob = new Blob([evt.target.result], {type});
                if(typeof callback === 'function') {
                    callback(blob)
                } else {
                    console.log("我是 blob:", blob);
                }
            };
            reader.readAsDataURL(file);
        };
        $("#fileToBlob").click(function (e) { 
            e.preventDefault();
            // 获取文件对象
            const _file = $("#file")[0].files[0];
            fileToBlob(_file, blob => {
                console.log('我是 blob:', blob);
            });
        });

    </script>
</body>
</html>
```

### File 转 Blob ###

主要应用场景：文件上传

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>File 转 Blob</title>
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
    <input type="file" name="file" id="file"></br>
    <button id="fileToBlob">File 转 Blob</button><br>
    <script>

        // 文件类型转Blob
        const fileToBlob = (file, callback) => {
            const type = file.type;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const blob = new Blob([evt.target.result], {type});
                if(typeof callback === 'function') {
                    callback(blob)
                } else {
                    console.log("我是 blob:", blob);
                }
            };
            reader.readAsDataURL(file);
        };
        $("#fileToBlob").click(function (e) { 
            e.preventDefault();
            // 获取文件对象
            const _file = $("#file")[0].files[0];
            fileToBlob(_file, blob => {
                console.log('我是 blob:', blob);
            });
        });

    </script>
</body>
</html>
```

### Base64 转 File ###

主要应用场景：文件上传

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base64 转 File</title>
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
    <img id="img" src="" alt="" srcset="">
    <br>
    <input style="display: none;" type="text" name="base64" id="base64" value="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABkAGQDAREAAhEBAxEB/8QAHQAAAQQDAQEAAAAAAAAAAAAAAAEEBQcCBggDCf/EAEUQAAEDAwMBBQMHBwoHAAAAAAECAwQFBhEAEiEHCBMUMUEiUWEVMkJScYGRCRYjcoSh0RckM1RjkrHBwsM2VmJzgqKz/8QAHAEAAQQDAQAAAAAAAAAAAAAAAAIEBQYBAwcI/8QAPxEAAQMCAwQHBwIDBwUAAAAAAQACAwQRBSExBhJBURMiYXGBkaEUFTJCsdHwUsFTkqIHFkNicoKyJERU4fH/2gAMAwEAAhEDEQA/AJFXHrrkJK9yACyTWLosOSNF0WHJGi6LDkjRdFhyRouiw5I0XRYckaLosOSNF0WHJGi6LDkjRdFhyRouiw5JRnnnSw4haXgXSa1rejQhGhCmoVlV6oR2pEekSnGHU723NoSFp94yRkfHTxlHUSDeYwkKBqMfwulkMM1Q0OGRF9E6jdN7nluONs0SWtaEpVtAHtA7sbOfb4QskJzgJUTgA6WKCqNx0ZyWh+0uDsa1zqltnXA8Nb8vFN12RXA800zTnJ6nQpSDTlJlpO3G4bmioZG5ORnI3D3jSX0VQw7pYb+f0S6faHCqmMyx1DbA2Nzu66a2XhOtarUymifLguRYxeLH6bCFhftDBQfaAyhYBIwSlQ9DrW+mmjZ0j22GieQYtQ1NQaSCUOfbesM8ud9PVRWNNlLJcH3aEJNCEaEI0ISp9ft0oLTJqk0lbkaEI0IVz2khirW9SmBUo9biQlxVTIUqEZKRvJAS/kJKGI5HeBAVtV3KitYCm0C70Lw6JrQ/eta9+HZ4LzVtXTVAxB8z4ejDnENI+b/N3nLlrkNSpLwNK6n2bBfYrVWcYiSJZXJ8D4lthbzIYKUpJDqUAP8AebUhR9lwkqwDp3C6OeO7HE58fzRQmL0lVh9Q2Ooiaw7o+HQi+p4Xyt5KTmVCJS7YbiuQ6dH8QIsbwMwxnQGGWgXEbX1JbW6FLAUVbS2WwAk7cq3OkYwWJA8QoyOhqp94xRudbP4TxvY5BR1zrptvW/Kq9bgzk+PQYxp851D6YvdIbaiNojhfcnavxEhIRhPdkjIS4M6KmSGOMvlzB4fTL1UtgNHiFTWtjoHlj7HrC4y43PkO/uWjLvyw1KKk2csIKwrutieEADe1u35y4cqDmMs52pChzqCNVQfwfp+fZdYGCbT3v7wHD804cvm1KT897GU2sfmusOlLgS8YrfsrUf0TmzvMEND2S3nD3zlFJ40n2mh/g/nP81Wfcm0+6B7eNDz+3Hnq3QLSKtLiTqtNfgRTChOPKUzHJz3aCeE6hZt1zy5gsOAXRaFk0NNHHUv33gAE8zzTXWiyfXRosi6VPmft1kLVJqk0lbkaEI0ISLG9Kk5IBGDg+Y9x+GlBxboUhzGv+IXWKWu7ILalNKT5KQogj7xrIe4G4KS6JjxuuFwpSmWiwudDgOx6hUKzOaEiNb9DiCTUHmT5PLCiluOyfRx1Qz5hKhzqZp6CScgu8uNufILneMbXUuGOdDTDfc3Im9mg8rjMkcQPNbs70TuWJT/EvdNH0Ap3Bo3ez477AlUUMk49N/8A5anfcpcPh/qz+llz0bf1jZL3ZbluG3ne60idS2WmZEiEuUpqLI8JNiT4/h5tPfI3BqQ1khJUkFSFpKkLAJSeCBW6ujdTm4007R3j8C6xgO0kGMjoyN2QC9r3BHNp49o1Cj8ajVcUaEI0IRoQlT5n7dYC1yapzCbhNsTqjVZC4lGprBlzXmU73O7CkpCG0/ScWtSEJH1ljPAOnVNB077HQaqExzFm4PSGa13HJo4E9vYNT2LBE2JWaEiqMUqXQHm6jIpcqmTJSZKmnWm2nAoOJSnIUh5OQRwUnBII06raRtPYsuNQQc7FQOy2Pz4x0kdTYloBBAtcG40z0IXhqJV/RoQncaZFoVNqdwz4pnwqQyHhCHnNkLUERow9/eOlIIHO0L92pKggEsm88XDfXkPP0VP2oxR2G0W7EbSSdVp5c3eA9bLtvs3dHHellmuTa4tM++rhc+UriqRA3OyVc90k+jbQOxKRwME4510Onh6Juep1Xleqn6Z/V+EZD85lVZV/yivTCJ1Beth6JU5NJblGE9XktNqiBYVtK9u7epoHOVgeQyARzpqcRhbL0frwToYVO6LpMtL24pr2krKjUXqFadSi7Q1cfe2zKCefEIdacehEn1U1JaTtPnhwjyOlYjEJWh3E3b6XHqn2AVr6GpbI0/AQ7wvZw8QVzy9ElQHAxOivQpQAKmJLSm1p+1KgDrnDmOYbOFl63hniqWdJC4ObzBuPRYaQt6NCEaEJU+Z+3WAtcmqKw73XTe93OSqNCiTQB/Y1CKs/uzqWw4jeeDyB8iFzzbmPeo4Hf57ebXL2eUHF3qyPZTGuODLT8RJp6kk/jGGpfGGjr94PmFSv7P5d2rDObD6O/wDa8NVBd+RoQrB6TWqi8OqnTC3HUByIiTLvOotkcLbifzeED9j63FY1bcJhBDLjW58sh+68/beVpfWPjByY0NHe7rO9LBd/kYHv1c1xtfOYfk411/rLX4MG62G7MgTG1yNzKjNQl0d94ZP0CoNqSO8JHC0naTkarpwzelNj1fVWf3ruwAFvWt4d66I7V1sUq9bi6L2HLjeIiVS5UuPxdyhuiRo7rjg3AgjjAyCDzqTqGh4jjPE/QFRNI4x9JKNQPUkJLt7I8um08iwLokMxkDKbYu1a6rSlj6qFrPiIxP121nHu1rloWvB3fI5j7hPaLGZ6OQSMJa7m3I+I0PcQudaza0qLXX6JIpEu27rYbU+5bc5wPKfaT85+A+AEy2h5kDDiPpJOCdVGqw8x/AM+X2PH6rueA7ZxVe7DXkAnIPGQJ5OHyn+k9i1sEEZByNQa6kjQhKPM/brAWt+qZXvUF0Xo/esxhhMiRKaj0chw+w01JWre7j6SgWUpSPIFeecAalKEWbI8a5DwOv0XOdtpniOnpx8LnEk8eqMvqb9yc02e3U27jkI4VPolBq+P1HnWVf8A3TqexLrxF3MNP7LnexjzDicbDze30v8Ass9U4r0cgnAzoQuieybS0yOtt6ylJyaJa9BpbJI+YH0OSnQPtWoE6v2Fst4NH3Xk/aiczVkzjxkf6HdH0XXC/Lzx6an1TFonR0/KNBqlfJSs12rS56HE/TZDncxzn4sMtH79a2Zgnmt0wsQ3kAq0q1bZuftyUCjEpWLYtGVPASCopekvNt5PonDaeM+e/TcuBqQ3kD6lOQ0tpC/m4DyCuG9+olG6eihGsuuMIrNVYo0VaGytIkPbu7CyPmpJTjceMke/Th72stvcTZNGRukvu8BdMuqnSagdX7b+Sa2y4hxpYkQajFX3UunyB8x9hwcoWk+o4PkQRxrEkTZW2clRSuhdvN/+964fvq1qvb9frFHuNLQu2kMplyZUdrumK1AUrYipNIHCFhWEPtjhKyFDhR1ScRoiwl4GY17Rz7+fmu97G7R9IG0FQ64OTCdQf0E/8T4LW7irgsxFWDNvU2sxrdjxn689UXX0uqdd2rVFjFtaUtqaaWkqWsKO84xjjUnRYKZaKWpLQRGATe+p4DuCgcb2zqxiTaellLGucQ0AA33ct51wbgnQDgva46c3Q7jq1MQ6XkQ5TjCXCMFSUngn44xqqSwCORzORXacOrTXUUNVoXtBPedVF19oSumd9slPed3TWZwQfUsTGFk/3Cv7s6cUBze3mPoVU9to70kEo+V9v5mkfZQ3TymVanW05Va29So1Let+VQYfdzB4p12PUWy2lTB9onLShvTlIBBODwZqYufATJkA0geByXNNnon+9InwtJ6wJ5C7SDn4qdaQp4pS2hS1K8kpSST9w1VQ0k2C9Fue2MXebDtTo0WorSQKdN5H9Wc/hrJjk/SfIpsK2l/it/mH3XR3ZKf8N1h6qxnUKadk0u2pqEOJKVbPAqbPB9ykEa6DhvzDsb9F5Q2hH/UvINxvyf8AK/7qr+3z2rbktS5adZ9hXEqktMsuOVadTyA+l8ObQwVkfo8BO445O4c4HOqvq3xkMiNua04bRxyAySi/JWx+T16pV7qX0PcarYQ8KFN+SocxtsIDzCWm1JSdvBUjdtJHmAM85Jd4fM6aLrcMkzxKFkM3U45qI7IlVa6kdduvPUcLQ7CeqTFHgSQeDHYCucnyBSGlffpNI7pZpZPBLrG9FBDDxsSfFb12zpDMrs61+sQHWpUihS4FWaW2oK2LYltLzkeXG77s6c1dxCXDhn5FNaI2na08bjzCuC0LqbuinqeDYadQRvQDkYIyCPgf8tOwbi6ZvaWGxVPdsSjt02xKd1FYjJkVKyZiJy2tmfFU91QZmxlf9K2lknPqgHTGsbaPpLX3fpxCf0DyJdwG29oeR4HzXHwp71xdLaXBlr3Vi/q0yuS6E8lUuUHnFH4IZSfuTq1zMFFs22M/FMRf/cb+gCjI3GpxtzhpEDbwFvUlZVCsfnHWqxVkp2tzpz8lAz9BSyU/+uNcVqJN6Z7hxK9j4RAaSghgPytA9E7LbjdsymYrEeTU7icdtmGma+WYzJeiuqeeeUAT7LaSEJ+ks+u0glO5tNC+pcL2ysO78sqdtlWPcIsOYMndcn/SRYDx17O9MLP6ZdU7FlQDTbloyaWzJMiVSH6/KdhT939Il1tSMYX9Ijn92m394YhpG63EWuCua+wvvvhwDuBGRB8FO1m3uoTsJqHQ3rTtNjvg7LXSLjmoflpSkhDSniN6EAqKtqSNxxnOBpDMdpo8o4XN565qTr5K3FC01kodu6CwAz1NuJUCbC6jfSuOAT7zflUH+vTobRwHWN3mfuoM4W79Y/lCl+lrHVXpR1Kcu6NWrXranYKqc5Bq1xvPbmCoLSnvlJKzsWCU5zgKUPI6XDtC2KUyNjdnwsUTYW2aLoy4Djl9leLvae6iyW+6m2j09lo+khV0qx+CmDp+NqYz8UTvIqN9wgaSKu+ofX+4rQ6eXm9b9iWPZsuqRQ3MqtvV9pySATsLiWQyjvHQla9vOQSDzjGtkW0MUx6KOIgnsSjg5a4OfJvAcFYfZcteDaHSDqJDoaHUUtF6S4zSXTucEdpLLad59T7OT8TqzULQ1jt3mVCVzy+RhdruhS/VWIqX0L6pNFJLBtuWVj03BBKc/HIOnVRnC/uP0WmA2mj/ANQVx9Dqapvp9Rqo46HHKnT4j5CfJI7lJ/HJOtkV9wX5BNZzeRw7Std7Xtbi0Ts3dQFSTzJpL0RpI5KnHAG0D+8tI+/SKk2geTyK20YvUR94XC7NZmuNKly6VOob1txEW5AgT2S0+moyIwEl9SD80NRspT65fSrjTfGcZ9rhiY0FrY2hovqXWzPgNFbNlcC6XELucHbx3zbTdByHide5e1PjJjRG2kjASAANc3JuSvUm4GgBOvHqZpc2G5Dp9TgyNi3YVViIlMKWgkoXsVxuTk4I59oj11tgqHQEgaFROKYLTYsxonvvNvYg2Of7KTtToRZtwXN1CQ/RobbcC5pUWOy3HTtaZ2NrQhOfIDecDUZjdXLR1ZZFkDmuJUAD4B0guRln2LaB2ZrBHnRYx/Z2/wCGq/71qf1KR6OP9ISHszWF6UWMP2Zs/wCnWPelSfmWNyMaNCxV2ZrGI9mkQx9sNo/5aWMSqBxWN1n6QkHZmsgHmkwj+wtfw0e85+aN2P8ASq3uLorbtOuu5+4t5mp0Wgmh1Co06I0lqW/DUqUZKY5QArdtSlagghSkNHnjV6wMmqpzNLnY+iruIv3JgxnVuD3Xy1/OK6z7DVRtufZ3USnWw7GlW3FvCd8ndwSpsw3W2nGsbucYJHPPBzzq80JZuOazQFU7EGva5hkGZaFvHak8DbnZp6kONtNRGl0aQ3htISCtaChP4lQGnNSbQv7imtIN6ojHaFUli9sulWpZFv0VVmXpKdp1PjxVuIt93ClIbSkke15ZBxpzHFPugdBJoPkPJYkYwvcelZa5+YKvupnaGl9Yr2ocObZN5s2RTpDdReYao2X6lJaUFMMKQpaUoYSvC1EqJWUgeyNaJ6atmIY2mfujP4TmU5gdSwMLzOwvOQ62gOviq9nV03fT6bXlNraVcNTq9xONu43oL0ssNpOPqtRkDjjzxqj4jISATxJPrZd12Fpg0TPPDdb5C/1KRPrqBXV36rBwbmlj3gj92kFbxqFbfT5xJvTqIkcKeqECeQP7emx1E/iDphtIAaljhxaF53px0bpY+T3D+oreyMaqVk+ukxosspc/DWViyM/DQhUTesqQxeHUOREfdiymJlupZfZWULbWI0xYUlQ5BGddBwhxjw3fbrvfdbsHhjqMYEUrQ5pY64OY1CsXpZ1iX0qve6q9KZpMyy7gmomTqy3KV4umpEVtqMiRHSjLbSXG3ELd5BU6g5AOTeaKpZcuuLHU8RlxCoONYPVUb+jlYWkEhuWTszoeOXBRPWntQwe0V0jkWtb9vVyXWKgxFkSqRBp70hUciW1uZecSkbAtAUpDuNpHPB406mq45oN2O5J9M1D09K6nm6SQiw0N9cvutEveyqBbF13qmFHqFbp8F2jogx5Fxzw02iTHkLcUFodCl5UynGSQOcaZVNXJBvOEjiBb5ncb9qtGDYO3FahtM8Bhs4nqtvkRzHatVXBpTqgVWVDex/Wq7VXh94MkaiXYtIcnEnvc77roLNg4h/ieTWD9lIoVIlSEPyG48dLTLcaNFhtd0xGYQMIabRn2UgfEkkkkkknULUzundcroeEYVFhUHQx95J1J5lOE+umyl36pMZGkLcFN/nO9Qq/NrNKuel041SFT2JMKq0aXJU07GjhkqStlQG1QGf4Y5f1VJR4luOkeWkCy4nWYJilPVTOiiDmOc5w6w0JvxTn+Vm4Mezd9mn/uUGrJ/wAM6ZDAqE/4x/PBMjQ4uP8At/6h90g6t3IB/wAVWIr9al1hP+2dBwCi4T/nkkmjxYa0x82/dZjq5cv/ADL09P60WsJ/2TrHuCj/AI/55JPsuK/+MfNv3Sp6vXKDj5e6dL++rp/xj6wdn6U6VH55JPs+KcaV3p91rM6rLnOV2TNqlHqVVrdSgySzQhJUxHajRnmvaU+2g7lF0YAz5HOONSjYIqKk9nY/ezv9furFs3Q1gxL2ieIsAaRnbMkjkTySxJMqmy0S4Ex+BMQClMiM4ULAIwRkehHmPI6aRyPjdvMNl1GqpIK2MxVDA5p4EXU6a1IqluIZqlebqcxMtxbrd01Gp9wGihIR3QiHlWS4FBz0Kdvrqagq2vZaZ2fbf9ly3GsCrKapa/CIGhls7Bl7/wC7hpa3iotuqraqNSddqtgvQ5kenxhT1MVstMCGhxDSkqSkLJ2uqzuJHlre6WB43S4Wyy63BV6HDsep6k1cMbhIb3PUz3rXy04L1qs6mSo0IRDTlVABzxRo6JSYmMjutviT3m/G7d5J+bj11EVYhu0xeNr29V1DZ12LOZJ715jd+G/bfdy7uKjs/DTFXCyyT66SdVofqslIA9TocLFYDzZYFlKzyM6TdBffUJBGbPprN7rFxyCFRW/qj8BoJRccgkVEb+qPwGlbxWQRyCPAs/V0bxWLjkEqYjbZylODoJJQHW0Cy2/HSErfKRTSVjB5GgGyxvX1CxTFb+qPw0q5QSOSXuUoPsjGhAdbQJcaFnfKyT5a2gBIJ3s1/9k=">
    <br>
    <button id="base64ToFile">Base64 转 File</button><br>
    <script>
        $("#img").attr({'src': $("#base64").val()})
        // Base64 转 File
        const base64ToFile = (base64, fileName) => {
            let arr = base64.split(','), type = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], fileName, {type});
        };
        $("#base64ToFile").click(function (e) { 
            e.preventDefault();
            // 获取base64
            const base64 = $("#base64").val();
            console.log("我是 base64:", base64);
            const file = base64ToFile(base64, 'fileName');
            console.log("我是 file:", file);
        });
    </script>
</body>
</html>
```

### Base64 转 Blob ###

主要应用场景：文件上传

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Base64 转 Blob</title>
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
    <img id="img" src="" alt="" srcset="">
    <br>
    <input style="display: none;" type="text" name="base64" id="base64" value="data:image/jpeg;base64,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">
    <br>
    <button id="base64ToBlob">Base64 转 Blob</button><br>
    <script>
        $("#img").attr({'src': $("#base64").val()})
        // Base64 转 Blob
        const base64ToBlob = base64 => {
            let arr = base64.split(','), type = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {type});
        };
        $("#base64ToBlob").click(function (e) { 
            e.preventDefault();
            // 获取base64
            const base64 = $("#base64").val();
            console.log("我是 base64:", base64);
            const blob = base64ToBlob(base64);
            console.log("我是 Blob:", blob);
        });
    </script>
</body>
</html>
```

### Blob 转 File ###

主要应用场景：文件上传

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blob 转 File</title>
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
    <input type="file" name="file" id="file"></br>
    <button id="fileToBlob">Blob 转 File</button><br>
    <script>

        // 文件类型转Blob
        const fileToBlob = (file, callback) => {
            const type = file.type;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const blob = new Blob([evt.target.result], {type});
                if(typeof callback === 'function') {
                    callback(blob)
                } else {
                    console.log("我是 blob:", blob);
                }
            };
            reader.readAsDataURL(file);
        };

        // Blob 转 File
        const blobToFile = (blob, fileName) => {
            const file = new File([blob], fileName, {type: blob.type});
            return file;
        }

        $("#fileToBlob").click(function (e) { 
            e.preventDefault();
            // 获取文件对象
            const _file = $("#file")[0].files[0];
            fileToBlob(_file, blob => {
                console.log('我是 blob:', blob);
                const file = blobToFile(blob, 'fileName');
                console.log('我是 file', file);
            });
        });
    </script>
</body>
</html>
```

### Blob 转 base64 ###

主要应用场景：图片预览

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blob 转 Base64</title>
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
</head>
<body>
    <input type="file" name="file" id="file"></br>
    <button id="blobToBase64">Blob 转 Base64</button><br>
    <script>

        // 文件类型转Blob
        const fileToBlob = (file, callback) => {
            const type = file.type;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const blob = new Blob([evt.target.result], {type});
                if(typeof callback === 'function') {
                    callback(blob)
                } else {
                    console.log("我是 blob:", blob);
                }
            };
            reader.readAsDataURL(file);
        };

        // Blob 转 Base64
        const blobToBase64 = (blob, callback) => {
            let r = new FileReader();
            r.onload = function (e) {
                if (typeof callback === 'function') {
                    callback(e.target.result);
                } else {
                    console.log("我是 base64: ", e.target.result);
                }
            }
            r.readAsDataURL(blob);
        }

        $("#blobToBase64").click(function (e) { 
            e.preventDefault();
            // 获取文件对象
            const _file = $("#file")[0].files[0];
            fileToBlob(_file, blob => {
                console.log('我是 blob:', blob);
                blobToBase64(blob, base64 => {
                    console.log("我是 base64: ", base64);
                });
            });
        });

    </script>
</body>
</html>
```
