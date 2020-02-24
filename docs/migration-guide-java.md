---
---

# Migration guide (Java)
Welcome!

As you may already know RAML 0.8/1.0 Java parser `raml-java-parser` has been deprecated in favor of the new and better one - `webapi-parser`. This guide describes how to migrate an existing code from `raml-java-parser` to `webapi-parser`.

Migration process consists of following steps:
1. [Considering parsers differences](#considering-parsers-differences)
2. Installing the new parser (as described in respective [readme section](https://github.com/raml-org/webapi-parser#java))
3. [Migrating the code](#migrating-the-code)

## Considering parsers differences
There are few differences to consider when migrating to `webapi-parser`:
* In addition to RAML 0.8 and RAML 1.0 parsing it can also resolve (flatten) it and validate. The parser also supports a number of other API Spec formats: OAS 2.0, OAS 3.0, AMF JSON-LD;
* `webapi-parser` provides only async/Promise-based API;
* API of the model/object it produces on parsing is completely different from the one produced by `raml-java-parser`. You can research the new model API by following the link in the [assistance section](#need-assistance) below.
* When using resource types, traits, data types and other means of reusing patterns, old parser used to "flatten" these abstractions into a parsed document, making it possible to navigate and inspect them after parsing. E.g. if a resource uses a resourceType which defines a `200` response you could navigate to that response from the resource via parsed model and inspect it immediately after parsing. To achieve this behaviour in the new parser one would have to parse AND perform a [model resolution](resolving.md).

## Migrating the code
Consider this code which uses `raml-java-parser`:
```java
package co.acme.parse;

import org.raml.v2.api.RamlModelBuilder;
import org.raml.v2.api.RamlModelResult;
import org.raml.v2.api.model.common.ValidationResult;
import org.raml.v2.api.model.v10.api.Api;

public class Raml10Parsing {
  public static void parse() throws InterruptedException {
    RamlModelResult ramlModelResult = new RamlModelBuilder().buildApi(input);
    if (ramlModelResult.hasErrors()) {
      for (ValidationResult validationResult : ramlModelResult.getValidationResults()) {
        System.out.println(validationResult.getMessage());
      }
    } else {
      Api api = ramlModelResult.getApiV10();
    }
  }
}
```

Here's how it can be reworked to use `webapi-parser`:
```java
package co.acme.parse;

import webapi.Raml10;
import webapi.WebApiBaseUnit;
import webapi.WebApiDocument;
import amf.client.validate.ValidationReport;
import amf.client.validate.ValidationResult;

import java.util.concurrent.ExecutionException;

public class Raml10Parsing {
  public static void parse() throws InterruptedException, ExecutionException {
    WebApiBaseUnit ramlModelResult = Raml10.parse(input).get();
    ValidationReport validationReport = Raml10.validate(ramlModelResult).get();
    if (!validationReport.conforms()) {
      for (ValidationResult validationResult : validationReport.results()) {
        System.out.println(validationResult.message());
      }
    } else {
      WebApiDocument document = (WebApiDocument) ramlModelResult;
    }
  }
}
```

In the example above, namespace `webapi` contains namespaces for all the supported API Spec formats: `Raml10`. `Raml08`, `Oas20`, `Oas30`, `AmfGraph`, each having an identical interface (OAS namespaces have an extra few methods). The list of supported operations each format supports includes parsing, resolution(flattening), validation and string generation.

To get a description of each namespace and operation please research the new model API by following the link in the [assistance section](#need-assistance) below.

## Detailed migration examples
This section lists migration examples of the most common `raml-java-parser` parsing and model methods. Snippets are separated with a newline. First line of each example shows `raml-java-parser` method usage, while the second line shows how to achieve the same functionality with `webapi-parser` if possible. If no obvious alternative exists, a comment gives more detail.

### Parsers
```java
import org.raml.v2.api.RamlModelBuilder;
import webapi.Raml10;

new RamlModelBuilder().buildApi(ramlFile);
// Not supported

new RamlModelBuilder().buildApi(reader, ramlLocation);
// Not supported

new RamlModelBuilder().buildApi(ramlLocation);
Raml10.parse(ramlLocation).get();
Raml08.parse(ramlLocation).get();

new RamlModelBuilder().buildApi(content, ramlLocation);
Raml10.parse(content, ramlLocation).get();
Raml08.parse(content, ramlLocation).get();
```

### API Models
```java
import org.raml.v2.api.RamlModelResult;
import org.raml.v2.api.model.v10.api.Api;
import webapi;

Api oldModel = new RamlModelBuilder().buildApi(input).getApiV08();
webapi.WebApiDocument newModel = (webapi.WebApiDocument) Raml08.parse(input).get();

Api oldModel = new RamlModelBuilder().buildApi(input).getApiV10();
webapi.WebApiDocument newModel = (webapi.WebApiDocument) Raml10.parse(input).get();

RamlModelResult oldResult = new RamlModelBuilder().buildApi(input);
webapi.WebApiBaseUnit newResult = (webapi.WebApiBaseUnit) Raml10.parse(input).get();

oldResult.hasErrors();
// Validation must be performed. See example above.

oldResult.getValidationResults();
// Validation must be performed. See example above.

oldResult.getLibrary();
(webapi.WebApiModule) newResult;

oldResult.getTypeDeclaration();
(webapi.WebApiDataType) newResult;

oldResult.getTypeDeclaration();
(webapi.WebApiDataType) newResult;

oldResult.getSecurityScheme();
(webapi.WebApiSecuritySchemeFragment) newResult;

oldResult.getTrait();
(webapi.WebApiTraitFragment) newResult;

oldResult.getResourceType();
(webapi.WebApiResourceTypeFragment) newResult;

oldResult.getResourceType();
(webapi.WebApiResourceTypeFragment) newResult;

oldModel.resources();
newModel.encodes().endPoints();
// Note that webapi-parser resources are flat and occur in the order defined in the RAML doc.

oldModel.resources().get(0).methods();
newModel.encodes().endPoints().get(0).operations();
```

For more details on navigating the new model, please refer to [Navigating a "WebApi" Model](navigating.md) tutorial.


## Need Assistance?
Here are the things to do if you have more questions:
* Check out more of our [tutorials](SUMMARY.md)
* Explore relevant [examples](https://github.com/raml-org/webapi-parser/tree/master/examples/java)
* Research the API with the [developer documentation](https://raml-org.github.io/webapi-parser/java/index.html)
* Ask your question at [github issues](https://github.com/raml-org/webapi-parser/issues)