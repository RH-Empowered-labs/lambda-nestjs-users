#!/bin/bash
API_NAME="MoviesApiGetway" # el nombre de tu API
RESOURCE_PATH="/movies" # la ruta que quieres configurar
STAGE_NAME="dev" # el nombre de la etapa

FUNCTION_NAME=$(serverless info --verbose | grep "api: " | cut -d " " -f 4)
LAMBDA_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)

echo $LAMBDA_ARN

# Obtén el ID de la API
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text)

echo $API_ID

# Crea la integración de Lambda
INTEGRATION_ID=$(aws apigatewayv2 create-integration --api-id $API_ID --integration-type AWS_PROXY --integration-method ANY --integration-uri $LAMBDA_ARN --payload-format-version 2.0 --query 'IntegrationId' --output text)

echo $INTEGRATION_ID

# Verifica si la ruta ya existe
ROUTE_ID=$(aws apigatewayv2 get-routes --api-id $API_ID --query "Items[?RouteKey=='ANY $RESOURCE_PATH/{proxy+}'].RouteId" --output text)

if [ -z "$ROUTE_ID" ]
then
    echo "La ruta no existe. Creándola..."
    # Crea la ruta
    aws apigatewayv2 create-route --api-id $API_ID --route-key "ANY $RESOURCE_PATH/{proxy+}" --target "integrations/$INTEGRATION_ID" >/dev/null
else
    echo "La ruta ya existe. Actualizando..."
    # Actualiza la ruta
    aws apigatewayv2 update-route --api-id $API_ID --route-id $ROUTE_ID --target "integrations/$INTEGRATION_ID" >/dev/null
fi

# Crea el despliegue
DEPLOYMENT_ID=$(aws apigatewayv2 create-deployment --api-id $API_ID --query 'DeploymentId' --output text)
echo "Deployment ID: $DEPLOYMENT_ID"

# Valida si la etapa existe
STAGE=$(aws apigatewayv2 get-stages --api-id $API_ID --query "Items[?StageName=='$STAGE_NAME'].StageName" --output text)

# Si la etapa existe, actualízala
if [ "$STAGE" == "$STAGE_NAME" ]; then
  echo "Actualizando la etapa $STAGE_NAME..."
  aws apigatewayv2 update-stage --api-id $API_ID --stage-name $STAGE_NAME --deployment-id $DEPLOYMENT_ID >/dev/null
else
  echo "Creando la etapa $STAGE_NAME..."
  aws apigatewayv2 create-stage --api-id $API_ID --stage-name $STAGE_NAME --deployment-id $DEPLOYMENT_ID >/dev/null
fi

# Agrega permisos a la función Lambda solo si no los tiene ya
PERMISSIONS=$(aws lambda get-policy --function-name $FUNCTION_NAME --query 'Policy' --output text)
if echo $PERMISSIONS | grep -q "$API_ID"; then
    echo "La función Lambda ya tiene los permisos necesarios."
else
    echo "Agregando permisos a la función Lambda..."
    STATEMENT_ID="apigateway-access-$(date +%s)"  # agregamos un timestamp para hacer el identificador único
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:us-east-1:590643504728:$API_ID/*/$STAGE_NAME/$RESOURCE_PATH/{proxy+}" \
        --statement-id $STATEMENT_ID >/dev/null
fi
