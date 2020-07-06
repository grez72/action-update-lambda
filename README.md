# action-update-lambda
 Github Action to Update an AWS Lambda Function and Alias

# How to use

Works with zip package created in steps prior to this action.

Add secrets to your github repo (Settings -> Secrets):
  * AWS_REGION
  * AWS_ACCESS_KEY_ID
  * AWS_SECRET_ACCESS_KEY

Example: Update Lambda Function and Alias ("prod"), when there's a push to the master branch.

```
name: Test update Lambda Function and Alias
on:
  push: 
    paths-ignore:
      - README.md
jobs:
  lambda:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - run: echo "THIS IS A TEST PACKAGE, v0.0.2" > file.txt
      - run: zip lambda.zip file.txt
      - name: AWS Lambda Deploy Production Version if master branch
        if: github.ref == 'refs/heads/master'
        uses: grez72/action-update-lambda@master
        with:
          package: lambda.zip
          function-name: ACTION-TEST-FUNCTION
          AWS_REGION: ${{ secrets.AWS_REGION }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          alias-name: prod
          publish: true
          dry-run: false
```