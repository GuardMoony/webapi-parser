package webapi

import amf.client.model.document.{Document, BaseUnit}
import amf.client.model.domain.{WebApi}
import amf.client.convert.CoreClientConverters._

import org.scalatest.{AsyncFunSuite, Matchers, Assertion}
import org.scalatest.Assertions._

import scala.concurrent.ExecutionContext
import scala.io.Source


class Raml08Test extends AsyncFunSuite with Matchers {

  override implicit val executionContext: ExecutionContext = ExecutionContext.Implicits.global

  private val validFilePath     = "file://shared/src/test/resources/raml/magic-api.raml"
  private val invalidFilePath   = "file://shared/src/test/resources/raml/invalid-examples-08.raml"
  private val generatedFilePath = s"${System.getProperty("java.io.tmpdir")}/generated-raml08.raml"
  private val apiString: String =
    """#%RAML 0.8
      |title: Magic API
      |version: v3
      |baseUri: https://magic.api.com
      |/items:
      |  get:
      |    description: Get a list of magic items
      |    queryParameters:
      |      page: integer
      |      per_page: integer""".stripMargin

  test("String parsing") {
    for {
      unit <- Raml08.parse(apiString).asInternal
    } yield {
      assertApiParsed(unit)
    }
  }

  test("File parsing") {
    for {
      unit <- Raml08.parse(validFilePath).asInternal
    } yield {
      assertApiParsed(unit)
    }
  }

  test("File generation") {
    for {
      unit <- Raml08.parse(apiString).asInternal
      _ <- Raml08.generateFile(unit, s"file://${generatedFilePath}").asInternal
    } yield {
      val genStr = Source.fromFile(generatedFilePath).getLines.mkString
      genStr should include ("#%RAML 0.8")
      genStr should include ("/items:")
    }
  }

  test("String generation") {
    for {
      unit <- Raml08.parse(apiString).asInternal
      genStr <- Raml08.generateString(unit).asInternal
    } yield {
      genStr should include ("#%RAML 0.8")
      genStr should include ("/items:")
    }
  }

  test("Validation") {
    for {
      unit <- Raml08.parse(invalidFilePath).asInternal
      report <- Raml08.validate(unit).asInternal
    } yield {
      report.conforms should be (false)
      report.results should have size 1
    }
  }

  test("Resolution") {
    for {
      unit <- Raml08.parse(apiString).asInternal
      resolved <- Raml08.resolve(unit).asInternal
      genStr <- Raml08.generateString(resolved).asInternal
    } yield {
      genStr should include ("page:")
      genStr should not include ("page: integer")
      genStr should not include ("per_page: integer")
    }
  }

  def assertApiParsed (unit: BaseUnit): Assertion = {
    val doc = unit.asInstanceOf[Document]
    val api = doc.encodes.asInstanceOf[WebApi]
    api.endPoints should have size 1
    api.name.value() should be ("Magic API")
  }
}