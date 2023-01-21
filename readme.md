## aws-cost-cli
> A CLI tool to perform cost analysis on your AWS account

## Usage

Install the package globally or alternatively use `npx`

```bash
npm install -g aws-cost-cli
```

In order to use the CLI, you need to pass the AWS credentials via environment variables. You can either provide them inline while i.e.

```bash
AWS_ACCESS_KEY=XXX AWS_SECRET_KEY=YYY AWS_REGION=ZZZ aws-cost
```

or you can create a `.env` file with the following content:

```bash
AWS_ACCESS_KEY=<your-aws-access-key>
AWS_SECRET_KEY=<your-aws-secret-key>
AWS_REGION=<your-aws-region>
```

and then run the command with the path to the `.env` file:

```bash
aws-cost --config /path/to/the.env
```

## Options

For the simple usage, just run the command without any options. The output will be a table with the cost breakdown by service. Optionally, you can pass the following options to modify the output:

```bash
$ aws-cost --help

  Usage: aws-cost [options]
  
  Simple CLI to get your AWS costs
  
  Options:
    -V, --version        output the version number
    -c, --config [path]  Path to the config file
    -s, --summary        Get only the summary without service breakdown
    -j, --json           Get the output as JSON
    -t, --text           Get the output as plain text (no colors / tables)
    -v, --version        Get the version of the CLI
    -h, --help           Get the help of the CLI
```

## Note

Regarding the credentials, you need to have the following permissions in order to use the CLI:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "iam:ListAccountAliases",
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    }
  ]
}
```

## License
MIT &copy; [Kamran Ahmed](https://twitter.com/kamranahmedse)