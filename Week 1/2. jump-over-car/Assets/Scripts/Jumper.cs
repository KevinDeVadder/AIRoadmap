using System;
using Unity.MLAgents;
using Unity.MLAgents.Actuators;
using UnityEngine;

public class Jumper : Agent
{
    [SerializeField] private float jumpForce;
    [SerializeField] private KeyCode jumpKey;
    
    private bool jumpIsReady = true;
    private Rigidbody rBody;
    private Vector3 startingPosition;
    private int score = 0;
    public event Action OnReset;
    
    public override void Initialize()
    {
        rBody = GetComponent<Rigidbody>();
        startingPosition = transform.position;
    }

    public override void OnActionReceived(ActionBuffers actions)
    {
        if (Mathf.FloorToInt(actions.DiscreteActions[0]) == 1)
        {
            Jump();
        }
    }

    public override void OnEpisodeBegin()
    {
        Reset();
    }

    private void FixedUpdate()
    {
        if (jumpIsReady)
        {
            RequestDecision();
        }
    }

    private void Jump()
    {
        if (jumpIsReady)
        {
            rBody.AddForce(new Vector3(0, jumpForce, 0), ForceMode.VelocityChange);
            jumpIsReady = false;
        }
    }
    private void Reset()
    {
        score = 0;
        jumpIsReady = true;
        
        //Reset Movement and Position
        transform.position = startingPosition;
        rBody.velocity = Vector3.zero;
        
        OnReset?.Invoke();
    }

    private void OnCollisionEnter(Collision collidedObj)
    {
        if (collidedObj.gameObject.CompareTag("Street"))
            jumpIsReady = true;

        else if (collidedObj.gameObject.CompareTag("Mover") || collidedObj.gameObject.CompareTag("DoubleMover"))
        {
            Debug.Log(score);
            if(score == 0)
            {
                AddReward(-1.0f);
            }
            else
            {
                AddReward(score);
            }
            EndEpisode();
        }
    }

    private void OnTriggerEnter(Collider collidedObj)
    {
        if (collidedObj.gameObject.CompareTag("score"))
        {
            score++;
            ScoreCollector.Instance.AddScore(score);
        }
    }
}
