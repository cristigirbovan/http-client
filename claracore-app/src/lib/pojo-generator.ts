export class PojoGenerator {
  static generateFromJson(json: string, className: string = 'ApiResponse'): string {
    try {
      const obj = JSON.parse(json)
      return this.generateClass(obj, className)
    } catch (error) {
      return '// Invalid JSON'
    }
  }

  private static generateClass(obj: any, className: string, isNested = false): string {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return ''
    }

    let code = ''
    const nestedClasses: string[] = []

    // Class declaration
    code += `@Data\n`
    code += `@NoArgsConstructor\n`
    code += `@AllArgsConstructor\n`
    code += `public ${isNested ? 'static ' : ''}class ${className} {\n`

    // Fields
    for (const [key, value] of Object.entries(obj)) {
      const fieldName = this.toCamelCase(key)
      const fieldType = this.getJavaType(value, this.capitalize(fieldName))

      // Check if nested object
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const nestedClassName = this.capitalize(fieldName)
        nestedClasses.push(this.generateClass(value, nestedClassName, true))
        code += `    private ${nestedClassName} ${fieldName};\n`
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        const nestedClassName = this.capitalize(this.singularize(fieldName))
        nestedClasses.push(this.generateClass(value[0], nestedClassName, true))
        code += `    private List<${nestedClassName}> ${fieldName};\n`
      } else {
        code += `    private ${fieldType} ${fieldName};\n`
      }
    }

    code += '}\n'

    // Add nested classes
    if (nestedClasses.length > 0) {
      code += '\n' + nestedClasses.join('\n')
    }

    return code
  }

  private static getJavaType(value: any, className: string): string {
    if (value === null) return 'Object'

    switch (typeof value) {
      case 'string':
        return 'String'
      case 'number':
        return Number.isInteger(value) ? 'Long' : 'Double'
      case 'boolean':
        return 'Boolean'
      case 'object':
        if (Array.isArray(value)) {
          if (value.length === 0) return 'List<Object>'
          const firstType = this.getJavaType(value[0], className)
          return `List<${firstType}>`
        }
        return className
      default:
        return 'Object'
    }
  }

  private static toCamelCase(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[A-Z]/, (letter) => letter.toLowerCase())
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  private static singularize(str: string): string {
    if (str.endsWith('ies')) return str.slice(0, -3) + 'y'
    if (str.endsWith('ses')) return str.slice(0, -2)
    if (str.endsWith('s')) return str.slice(0, -1)
    return str
  }

  static generateWithJackson(json: string, className: string = 'ApiResponse'): string {
    const basic = this.generateFromJson(json, className)

    // Add Jackson annotations
    const withJackson = basic
      .replace(/@Data/g, '@Data\n@JsonIgnoreProperties(ignoreUnknown = true)')
      .replace(/private (\w+) (\w+);/g, '    @JsonProperty("$2")\n    private $1 $2;')

    // Add imports
    const imports = `import com.fasterxml.jackson.annotation.JsonIgnoreProperties;\n`
      + `import com.fasterxml.jackson.annotation.JsonProperty;\n`
      + `import lombok.AllArgsConstructor;\n`
      + `import lombok.Data;\n`
      + `import lombok.NoArgsConstructor;\n`
      + `import java.util.List;\n\n`

    return imports + withJackson
  }
}
