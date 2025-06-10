# JPEG Trust Evaluator

This project is a command line tool that evaluates a JSON file according to the rules defined in a JPEG Trust Profile. It utilizes json-formula rules to assess the validity and compliance of the JSON data.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/jpeg-trust-evaluator.git
   ```

2. Navigate to the project directory:
   ```
   cd jpeg-trust-evaluator
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the tool, use the following command:

```
node src/index.js <path_to_jpeg_trust_profile> <path_to_json_file>
```

Replace `<path_to_jpeg_trust_profile>` with the path to your JPEG Trust Profile file and `<path_to_json_file>` with the path to your JSON file.

## Examples

1. Basic evaluation:
   ```
   node src/index.js profile.json data.json
   ```

2. Check the output for evaluation results.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.