using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public WheelCollider[] wheelCol;
    public Transform[] wheelMesh;

    public float maxMotorTorque;
    public float maxSteeringAngle;
    public float maxBreakTorque;

    // Start is called before the first frame update
    void Start()
    {
        for (int i = 0; i < wheelCol.Length; i++)
        {
            wheelCol[i].transform.position = wheelMesh[i].position;
        }
    }

    // Update is called once per frame
    void FixedUpdate()
    {
        float motor = maxMotorTorque * Input.GetAxis("Vertical") * 100000;
        float directie = maxSteeringAngle * Input.GetAxis("Horizontal");
        float frana = maxBreakTorque * 5;

        wheelCol[0].steerAngle = directie;
        wheelCol[1].steerAngle = directie;

        if (Input.GetKey("space"))
        {
            wheelCol[0].motorTorque = 0;
            wheelCol[1].motorTorque = 0;
            wheelCol[0].brakeTorque = frana;
            wheelCol[1].brakeTorque = frana;
        }
        else
        {
            wheelCol[0].motorTorque = motor;
            wheelCol[1].motorTorque = motor;
            wheelCol[0].brakeTorque = 0;
            wheelCol[1].brakeTorque = 0;
        }

        for (int i = 0; i < wheelMesh.Length; i++)
        {
            Vector3 p;
            Quaternion q;
            wheelCol[i].GetWorldPose(out p, out q);

            wheelMesh[i].position = p;
            wheelMesh[i].rotation = q;
        }
    }
}
