import { DynamicVariable } from '../types'

/**
 * Dynamic variables that can be used in requests
 * Similar to Postman's dynamic variables
 */
export const dynamicVariables: Record<string, DynamicVariable> = {
  // Timestamps
  $timestamp: {
    key: '$timestamp',
    generator: () => Math.floor(Date.now() / 1000),
    description: 'Current Unix timestamp in seconds',
  },
  $isoTimestamp: {
    key: '$isoTimestamp',
    generator: () => new Date().toISOString(),
    description: 'Current ISO 8601 timestamp',
  },

  // Random Numbers
  $randomInt: {
    key: '$randomInt',
    generator: () => Math.floor(Math.random() * 1000),
    description: 'Random integer between 0-1000',
  },
  $randomFloat: {
    key: '$randomFloat',
    generator: () => Math.random(),
    description: 'Random float between 0-1',
  },
  $randomBoolean: {
    key: '$randomBoolean',
    generator: () => Math.random() < 0.5,
    description: 'Random boolean (true/false)',
  },

  // UUIDs and GUIDs
  $guid: {
    key: '$guid',
    generator: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    description: 'GUID (UUID v4)',
  },
  $randomUUID: {
    key: '$randomUUID',
    generator: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    description: 'Random UUID (v4)',
  },

  // Random Text
  $randomAlphaNumeric: {
    key: '$randomAlphaNumeric',
    generator: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      return chars[Math.floor(Math.random() * chars.length)]
    },
    description: 'Random alphanumeric character',
  },
  $randomHexColor: {
    key: '$randomHexColor',
    generator: () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    description: 'Random hex color (e.g., #a3e2f0)',
  },

  // Personal Data
  $randomFirstName: {
    key: '$randomFirstName',
    generator: () => {
      const names = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen']
      return names[Math.floor(Math.random() * names.length)]
    },
    description: 'Random first name',
  },
  $randomLastName: {
    key: '$randomLastName',
    generator: () => {
      const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
      return names[Math.floor(Math.random() * names.length)]
    },
    description: 'Random last name',
  },
  $randomFullName: {
    key: '$randomFullName',
    generator: () => {
      const first = dynamicVariables.$randomFirstName.generator()
      const last = dynamicVariables.$randomLastName.generator()
      return `${first} ${last}`
    },
    description: 'Random full name',
  },
  $randomEmail: {
    key: '$randomEmail',
    generator: () => {
      const first = dynamicVariables.$randomFirstName.generator().toLowerCase()
      const last = dynamicVariables.$randomLastName.generator().toLowerCase()
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.com']
      const domain = domains[Math.floor(Math.random() * domains.length)]
      return `${first}.${last}@${domain}`
    },
    description: 'Random email address',
  },
  $randomUserName: {
    key: '$randomUserName',
    generator: () => {
      const first = dynamicVariables.$randomFirstName.generator().toLowerCase()
      const num = Math.floor(Math.random() * 9999)
      return `${first}${num}`
    },
    description: 'Random username',
  },

  // Address & Location
  $randomCity: {
    key: '$randomCity',
    generator: () => {
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Boston']
      return cities[Math.floor(Math.random() * cities.length)]
    },
    description: 'Random city name',
  },
  $randomStreetName: {
    key: '$randomStreetName',
    generator: () => {
      const names = ['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Lake', 'Hill', 'Park']
      const types = ['Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Road', 'Way']
      return `${names[Math.floor(Math.random() * names.length)]} ${types[Math.floor(Math.random() * types.length)]}`
    },
    description: 'Random street name',
  },
  $randomStreetAddress: {
    key: '$randomStreetAddress',
    generator: () => {
      const num = Math.floor(Math.random() * 9999) + 1
      return `${num} ${dynamicVariables.$randomStreetName.generator()}`
    },
    description: 'Random street address',
  },
  $randomCountry: {
    key: '$randomCountry',
    generator: () => {
      const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Australia', 'Japan', 'China', 'India', 'Brazil', 'Mexico', 'Russia', 'South Africa']
      return countries[Math.floor(Math.random() * countries.length)]
    },
    description: 'Random country name',
  },
  $randomCountryCode: {
    key: '$randomCountryCode',
    generator: () => {
      const codes = ['US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'AU', 'JP', 'CN', 'IN', 'BR', 'MX', 'RU', 'ZA']
      return codes[Math.floor(Math.random() * codes.length)]
    },
    description: 'Random country code (ISO)',
  },
  $randomZipCode: {
    key: '$randomZipCode',
    generator: () => {
      return String(Math.floor(Math.random() * 90000) + 10000)
    },
    description: 'Random 5-digit zip code',
  },

  // Internet & Tech
  $randomIP: {
    key: '$randomIP',
    generator: () => {
      return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    },
    description: 'Random IPv4 address',
  },
  $randomIPV6: {
    key: '$randomIPV6',
    generator: () => {
      const hex = () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
      return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`
    },
    description: 'Random IPv6 address',
  },
  $randomMACAddress: {
    key: '$randomMACAddress',
    generator: () => {
      const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      return `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`
    },
    description: 'Random MAC address',
  },
  $randomUrl: {
    key: '$randomUrl',
    generator: () => {
      const protocols = ['http', 'https']
      const domains = ['example.com', 'test.com', 'demo.com', 'api.example.com']
      const protocol = protocols[Math.floor(Math.random() * protocols.length)]
      const domain = domains[Math.floor(Math.random() * domains.length)]
      return `${protocol}://${domain}`
    },
    description: 'Random URL',
  },
  $randomDomainName: {
    key: '$randomDomainName',
    generator: () => {
      const words = ['tech', 'digital', 'web', 'cloud', 'data', 'smart', 'global', 'fast']
      const tlds = ['com', 'net', 'org', 'io', 'dev']
      const word = words[Math.floor(Math.random() * words.length)]
      const tld = tlds[Math.floor(Math.random() * tlds.length)]
      return `${word}.${tld}`
    },
    description: 'Random domain name',
  },
  $randomUserAgent: {
    key: '$randomUserAgent',
    generator: () => {
      const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      ]
      return agents[Math.floor(Math.random() * agents.length)]
    },
    description: 'Random user agent string',
  },

  // Phone Numbers
  $randomPhoneNumber: {
    key: '$randomPhoneNumber',
    generator: () => {
      const area = Math.floor(Math.random() * 900) + 100
      const prefix = Math.floor(Math.random() * 900) + 100
      const line = Math.floor(Math.random() * 9000) + 1000
      return `(${area}) ${prefix}-${line}`
    },
    description: 'Random phone number',
  },

  // Lorem Ipsum
  $randomLoremWord: {
    key: '$randomLoremWord',
    generator: () => {
      const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore']
      return words[Math.floor(Math.random() * words.length)]
    },
    description: 'Random Lorem Ipsum word',
  },
  $randomLoremSentence: {
    key: '$randomLoremSentence',
    generator: () => {
      const sentences = [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      ]
      return sentences[Math.floor(Math.random() * sentences.length)]
    },
    description: 'Random Lorem Ipsum sentence',
  },
  $randomLoremParagraph: {
    key: '$randomLoremParagraph',
    generator: () => {
      return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    },
    description: 'Random Lorem Ipsum paragraph',
  },

  // Commerce
  $randomPrice: {
    key: '$randomPrice',
    generator: () => {
      return (Math.random() * 1000).toFixed(2)
    },
    description: 'Random price (0.00 - 1000.00)',
  },
  $randomProduct: {
    key: '$randomProduct',
    generator: () => {
      const products = ['Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Camera', 'Watch', 'Keyboard', 'Mouse', 'Monitor', 'Speaker']
      return products[Math.floor(Math.random() * products.length)]
    },
    description: 'Random product name',
  },
  $randomProductAdjective: {
    key: '$randomProductAdjective',
    generator: () => {
      const adjectives = ['Premium', 'Professional', 'Deluxe', 'Standard', 'Essential', 'Ultimate', 'Advanced', 'Basic', 'Pro', 'Elite']
      return adjectives[Math.floor(Math.random() * adjectives.length)]
    },
    description: 'Random product adjective',
  },
  $randomDepartment: {
    key: '$randomDepartment',
    generator: () => {
      const departments = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Automotive', 'Health', 'Beauty', 'Food']
      return departments[Math.floor(Math.random() * departments.length)]
    },
    description: 'Random department name',
  },

  // Company
  $randomCompanyName: {
    key: '$randomCompanyName',
    generator: () => {
      const adjectives = ['Global', 'Digital', 'Smart', 'Tech', 'Advanced', 'Future']
      const nouns = ['Solutions', 'Systems', 'Technologies', 'Industries', 'Enterprises', 'Corp']
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
      const noun = nouns[Math.floor(Math.random() * nouns.length)]
      return `${adj} ${noun}`
    },
    description: 'Random company name',
  },
  $randomCompanySuffix: {
    key: '$randomCompanySuffix',
    generator: () => {
      const suffixes = ['Inc', 'LLC', 'Corp', 'Ltd', 'Group', 'Holdings']
      return suffixes[Math.floor(Math.random() * suffixes.length)]
    },
    description: 'Random company suffix',
  },

  // Dates
  $randomDatePast: {
    key: '$randomDatePast',
    generator: () => {
      const days = Math.floor(Math.random() * 365)
      const date = new Date()
      date.setDate(date.getDate() - days)
      return date.toISOString().split('T')[0]
    },
    description: 'Random date in the past year',
  },
  $randomDateFuture: {
    key: '$randomDateFuture',
    generator: () => {
      const days = Math.floor(Math.random() * 365)
      const date = new Date()
      date.setDate(date.getDate() + days)
      return date.toISOString().split('T')[0]
    },
    description: 'Random date in the next year',
  },
  $randomWeekday: {
    key: '$randomWeekday',
    generator: () => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      return days[Math.floor(Math.random() * days.length)]
    },
    description: 'Random weekday name',
  },
  $randomMonth: {
    key: '$randomMonth',
    generator: () => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      return months[Math.floor(Math.random() * months.length)]
    },
    description: 'Random month name',
  },

  // Files & Images
  $randomFileType: {
    key: '$randomFileType',
    generator: () => {
      const types = ['jpg', 'png', 'gif', 'pdf', 'doc', 'xls', 'txt', 'zip', 'mp3', 'mp4']
      return types[Math.floor(Math.random() * types.length)]
    },
    description: 'Random file extension',
  },
  $randomFileName: {
    key: '$randomFileName',
    generator: () => {
      const words = ['document', 'report', 'file', 'data', 'image', 'photo']
      const word = words[Math.floor(Math.random() * words.length)]
      const num = Math.floor(Math.random() * 9999)
      const ext = dynamicVariables.$randomFileType.generator()
      return `${word}_${num}.${ext}`
    },
    description: 'Random file name',
  },
  $randomImageUrl: {
    key: '$randomImageUrl',
    generator: () => {
      const width = [200, 300, 400, 500, 600][Math.floor(Math.random() * 5)]
      const height = [200, 300, 400, 500, 600][Math.floor(Math.random() * 5)]
      return `https://picsum.photos/${width}/${height}`
    },
    description: 'Random image URL (Lorem Picsum)',
  },
  $randomAvatarImage: {
    key: '$randomAvatarImage',
    generator: () => {
      const id = Math.floor(Math.random() * 1000)
      return `https://i.pravatar.cc/150?img=${id}`
    },
    description: 'Random avatar image URL',
  },
}

/**
 * Replace dynamic variables in a string
 */
export function replaceDynamicVariables(text: string): string {
  let result = text

  // Replace all dynamic variables
  Object.keys(dynamicVariables).forEach((key) => {
    const regex = new RegExp(`\\{\\{${key.replace('$', '\\$')}\\}\\}`, 'g')
    if (regex.test(result)) {
      // Generate value and replace all occurrences
      result = result.replace(regex, () => String(dynamicVariables[key].generator()))
    }
  })

  return result
}

/**
 * Get all dynamic variable keys for autocomplete
 */
export function getDynamicVariableKeys(): string[] {
  return Object.keys(dynamicVariables)
}

/**
 * Get dynamic variable description
 */
export function getDynamicVariableDescription(key: string): string | undefined {
  return dynamicVariables[key]?.description
}
